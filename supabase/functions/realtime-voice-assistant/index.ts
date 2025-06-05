
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, UPGRADE',
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  // Handle regular GET requests for testing
  if (req.method === 'GET') {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";
    
    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log('Regular GET request - returning test response');
      return new Response(JSON.stringify({ 
        status: 'Edge function is working', 
        timestamp: new Date().toISOString(),
        message: 'To use WebSocket, include Upgrade: websocket header'
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";
  const connectionHeader = headers.get("connection") || "";

  console.log('Upgrade header:', upgradeHeader);
  console.log('Connection header:', connectionHeader);

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log('ERROR: Not a WebSocket upgrade request');
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  // Check for OpenAI API key
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY is not set in environment');
    return new Response("API key not configured", { 
      status: 500,
      headers: corsHeaders 
    });
  }
  console.log('OpenAI API key found:', OPENAI_API_KEY ? 'YES' : 'NO');

  try {
    console.log('Attempting to upgrade WebSocket connection...');
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log('WebSocket upgrade successful');

    let openAISocket: WebSocket | null = null;
    let adData: any = null;

    // Set up client WebSocket handlers
    socket.onopen = () => {
      console.log('=== CLIENT WEBSOCKET CONNECTED ===');
      
      // Send a test message to confirm connection
      socket.send(JSON.stringify({ 
        type: 'connection_test', 
        message: 'WebSocket connection established successfully',
        timestamp: new Date().toISOString()
      }));
      
      // Start OpenAI connection
      connectToOpenAI();
    };

    socket.onmessage = (event) => {
      console.log('=== CLIENT MESSAGE RECEIVED ===');
      try {
        const data = JSON.parse(event.data);
        console.log('Client message type:', data.type);

        if (data.type === 'set_ad_data') {
          adData = data.adData;
          console.log('Ad data received and stored:', !!adData);
          return;
        }

        // Forward other messages to OpenAI
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
          console.log('Forwarding message to OpenAI:', data.type);
          openAISocket.send(JSON.stringify(data));
        } else {
          console.log('OpenAI socket not ready, message queued');
        }
      } catch (error) {
        console.error('Error processing client message:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message',
          details: error.toString()
        }));
      }
    };

    socket.onclose = (event) => {
      console.log('=== CLIENT WEBSOCKET DISCONNECTED ===');
      console.log('Close code:', event.code, 'Reason:', event.reason);
      if (openAISocket) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('=== CLIENT WEBSOCKET ERROR ===', error);
      if (openAISocket) {
        openAISocket.close();
      }
    };

    // Connect to OpenAI Realtime API
    const connectToOpenAI = () => {
      console.log('=== CONNECTING TO OPENAI REALTIME API ===');
      
      try {
        const openAIUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
        console.log('OpenAI URL:', openAIUrl);
        
        openAISocket = new WebSocket(
          openAIUrl,
          ["realtime", `openai-insecure-api-key.${OPENAI_API_KEY}`]
        );

        openAISocket.onopen = () => {
          console.log('=== OPENAI WEBSOCKET CONNECTED ===');
        };

        openAISocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('=== OPENAI MESSAGE ===', data.type);

            // Handle session creation
            if (data.type === 'session.created') {
              console.log('Session created, sending configuration...');
              
              const sessionConfig = {
                type: "session.update",
                session: {
                  modalities: ["text", "audio"],
                  instructions: `You are a friendly AI assistant that explains Facebook ad performance to business owners in very simple terms (3rd grade level). 

When users ask questions about their ads, analyze the provided data and explain:
1. Which ads are performing best and why
2. Which ads are underperforming and why  
3. Simple suggestions to improve performance
4. Use very simple language a 3rd grader could understand
5. Be encouraging and helpful
6. Keep explanations short and clear

Focus on metrics like spend, revenue, ROAS (return on ad spend), and click-through rates.
Always be ready to answer specific questions about the user's ad performance data.`,
                  voice: "echo",
                  input_audio_format: "pcm16",
                  output_audio_format: "pcm16",
                  input_audio_transcription: {
                    model: "whisper-1"
                  },
                  turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1000
                  },
                  tools: [
                    {
                      type: "function",
                      name: "analyze_ad_data",
                      description: "Analyze Facebook ad performance data and provide insights",
                      parameters: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          focus_area: { type: "string" }
                        },
                        required: ["question"]
                      }
                    }
                  ],
                  tool_choice: "auto",
                  temperature: 0.7,
                  max_response_output_tokens: "inf"
                }
              };

              console.log('Sending session configuration...');
              openAISocket!.send(JSON.stringify(sessionConfig));
              
              // Send initial context about the ad data if available
              if (adData) {
                console.log('Sending ad data context...');
                const contextMessage = {
                  type: "conversation.item.create",
                  item: {
                    type: "message",
                    role: "system",
                    content: [
                      {
                        type: "text",
                        text: `Here is the user's Facebook ad data for analysis: ${JSON.stringify(adData, null, 2)}`
                      }
                    ]
                  }
                };
                openAISocket!.send(JSON.stringify(contextMessage));
              }
            }

            // Handle function calls
            if (data.type === 'response.function_call_arguments.done') {
              console.log('Function call completed:', data.call_id);
              const args = JSON.parse(data.arguments);
              console.log('Function call args:', args);
              
              const analysisContext = {
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: data.call_id,
                  output: JSON.stringify({
                    analysis: `Based on your ad data: ${JSON.stringify(adData, null, 2)}`,
                    question: args.question
                  })
                }
              };
              openAISocket!.send(JSON.stringify(analysisContext));
              openAISocket!.send(JSON.stringify({type: 'response.create'}));
            }

            // Forward all messages to client
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(data));
            } else {
              console.log('Client socket not ready, dropping message:', data.type);
            }

          } catch (error) {
            console.error('Error processing OpenAI message:', error);
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ 
                type: 'error', 
                message: 'Error processing AI response',
                details: error.toString()
              }));
            }
          }
        };

        openAISocket.onerror = (error) => {
          console.error('=== OPENAI WEBSOCKET ERROR ===', error);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'Connection to AI failed',
              details: error.toString()
            }));
          }
        };

        openAISocket.onclose = (event) => {
          console.log('=== OPENAI WEBSOCKET CLOSED ===');
          console.log('Close code:', event.code, 'Reason:', event.reason);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
              type: 'connection_closed',
              code: event.code,
              reason: event.reason
            }));
          }
        };

      } catch (error) {
        console.error('Error creating OpenAI WebSocket:', error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to connect to AI',
            details: error.toString()
          }));
        }
      }
    };

    console.log('Returning WebSocket response...');
    return response;

  } catch (error) {
    console.error('=== WEBSOCKET UPGRADE ERROR ===', error);
    return new Response(`Failed to upgrade to WebSocket: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
