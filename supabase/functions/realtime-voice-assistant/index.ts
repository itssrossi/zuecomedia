
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, UPGRADE',
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests for testing (no auth required since verify_jwt=false)
  if (req.method === 'GET') {
    const upgradeHeader = req.headers.get("upgrade") || "";
    
    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log('GET request - returning status');
      return new Response(JSON.stringify({ 
        status: 'Edge function is working', 
        timestamp: new Date().toISOString(),
        message: 'Use WebSocket upgrade for voice assistant',
        verify_jwt: false
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Check for WebSocket upgrade
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log('Not a WebSocket request');
    return new Response("WebSocket upgrade required", { 
      status: 426,
      headers: { ...corsHeaders, 'Upgrade': 'websocket' }
    });
  }

  // Check OpenAI API key
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured');
    return new Response("API key not configured", { 
      status: 500,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Upgrading to WebSocket...');
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;
    let adData: any = null;
    let sessionReady = false;

    socket.onopen = () => {
      console.log('=== CLIENT CONNECTED ===');
      
      // Send immediate confirmation
      socket.send(JSON.stringify({ 
        type: 'connection_established',
        status: 'connected',
        timestamp: new Date().toISOString()
      }));
      
      // Connect to OpenAI immediately
      connectToOpenAI();
    };

    socket.onmessage = (event) => {
      console.log('Client message received');
      try {
        const data = JSON.parse(event.data);
        console.log('Message type:', data.type);

        if (data.type === 'set_ad_data') {
          adData = data.adData;
          console.log('Ad data stored');
          return;
        }

        // Forward to OpenAI if session is ready
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN && sessionReady) {
          console.log('Forwarding to OpenAI:', data.type);
          openAISocket.send(JSON.stringify(data));
        } else {
          console.log('OpenAI not ready, session ready:', sessionReady);
        }
      } catch (error) {
        console.error('Error processing client message:', error);
      }
    };

    socket.onclose = () => {
      console.log('=== CLIENT DISCONNECTED ===');
      if (openAISocket) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('Client socket error:', error);
    };

    const connectToOpenAI = () => {
      console.log('=== CONNECTING TO OPENAI ===');
      
      try {
        const openAIUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
        console.log('OpenAI URL:', openAIUrl);
        
        openAISocket = new WebSocket(
          openAIUrl,
          ["realtime", `openai-insecure-api-key.${OPENAI_API_KEY}`]
        );

        openAISocket.onopen = () => {
          console.log('=== OPENAI CONNECTED ===');
          socket.send(JSON.stringify({ 
            type: 'openai_connected',
            status: 'connected'
          }));
        };

        openAISocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('OpenAI message:', data.type);

            if (data.type === 'session.created') {
              console.log('Session created, configuring...');
              
              const sessionConfig = {
                type: "session.update",
                session: {
                  modalities: ["text", "audio"],
                  instructions: `You are a friendly AI assistant that explains Facebook ad performance to business owners in very simple terms. 

When users ask questions about their ads, analyze the provided data and explain:
1. Which ads are performing best and why
2. Which ads are underperforming and why  
3. Simple suggestions to improve performance
4. Use very simple language a 3rd grader could understand
5. Be encouraging and helpful
6. Keep explanations short and clear

Focus on metrics like spend, revenue, ROAS (return on ad spend), and click-through rates.`,
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
                  temperature: 0.7,
                  max_response_output_tokens: "inf"
                }
              };

              openAISocket!.send(JSON.stringify(sessionConfig));
            } else if (data.type === 'session.updated') {
              console.log('Session configured successfully');
              sessionReady = true;
              
              socket.send(JSON.stringify({ 
                type: 'session_ready',
                status: 'ready'
              }));
              
              // Send ad data context if available
              if (adData) {
                console.log('Sending ad data context');
                const contextMessage = {
                  type: "conversation.item.create",
                  item: {
                    type: "message",
                    role: "system",
                    content: [
                      {
                        type: "text",
                        text: `Here is the user's Facebook ad data: ${JSON.stringify(adData)}`
                      }
                    ]
                  }
                };
                openAISocket!.send(JSON.stringify(contextMessage));
              }
            }

            // Forward all messages to client
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(data));
            }
          } catch (error) {
            console.error('Error processing OpenAI message:', error);
          }
        };

        openAISocket.onerror = (error) => {
          console.error('OpenAI socket error:', error);
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'OpenAI connection failed'
          }));
        };

        openAISocket.onclose = (event) => {
          console.log('OpenAI socket closed:', event.code, event.reason);
          sessionReady = false;
        };

      } catch (error) {
        console.error('Error creating OpenAI socket:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to connect to OpenAI'
        }));
      }
    };

    return response;

  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    return new Response(`WebSocket upgrade failed: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
