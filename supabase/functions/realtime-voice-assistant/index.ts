
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, UPGRADE',
};

serve(async (req) => {
  console.log('=== REALTIME VOICE ASSISTANT FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests for testing (completely public)
  if (req.method === 'GET') {
    const upgradeHeader = req.headers.get("upgrade") || "";
    
    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log('GET request - returning status page');
      return new Response(JSON.stringify({ 
        status: 'Realtime Voice Assistant is running', 
        timestamp: new Date().toISOString(),
        message: 'Use WebSocket upgrade for voice functionality',
        verify_jwt: false,
        public: true
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
    return new Response("Server configuration error", { 
      status: 500,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== UPGRADING TO WEBSOCKET ===');
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;
    let adData: any = null;
    let sessionReady = false;

    socket.onopen = () => {
      console.log('=== CLIENT WEBSOCKET CONNECTED ===');
      
      // Send immediate connection confirmation
      socket.send(JSON.stringify({ 
        type: 'connection_established',
        status: 'connected',
        timestamp: new Date().toISOString(),
        message: 'WebSocket connection successful'
      }));
      
      // Connect to OpenAI immediately
      connectToOpenAI();
    };

    socket.onmessage = (event) => {
      console.log('=== CLIENT MESSAGE RECEIVED ===');
      try {
        const data = JSON.parse(event.data);
        console.log('Message type:', data.type);

        if (data.type === 'set_ad_data') {
          adData = data.adData;
          console.log('Ad data stored successfully');
          return;
        }

        // Forward to OpenAI if ready
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN && sessionReady) {
          console.log('Forwarding message to OpenAI:', data.type);
          openAISocket.send(JSON.stringify(data));
        } else {
          console.log('OpenAI not ready - session ready:', sessionReady, 'socket state:', openAISocket?.readyState);
        }
      } catch (error) {
        console.error('Error processing client message:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message'
        }));
      }
    };

    socket.onclose = (event) => {
      console.log('=== CLIENT WEBSOCKET DISCONNECTED ===', event.code, event.reason);
      if (openAISocket) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('=== CLIENT WEBSOCKET ERROR ===', error);
    };

    const connectToOpenAI = () => {
      console.log('=== CONNECTING TO OPENAI REALTIME API ===');
      
      try {
        const openAIUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
        console.log('OpenAI WebSocket URL:', openAIUrl);
        
        openAISocket = new WebSocket(
          openAIUrl,
          ["realtime", `openai-insecure-api-key.${OPENAI_API_KEY}`]
        );

        openAISocket.onopen = () => {
          console.log('=== OPENAI WEBSOCKET CONNECTED ===');
          socket.send(JSON.stringify({ 
            type: 'openai_connected',
            status: 'connected',
            message: 'Connected to OpenAI Realtime API'
          }));
        };

        openAISocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('=== OPENAI MESSAGE ===', data.type);

            if (data.type === 'session.created') {
              console.log('OpenAI session created, configuring...');
              
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
              console.log('OpenAI session configured successfully');
              sessionReady = true;
              
              socket.send(JSON.stringify({ 
                type: 'session_ready',
                status: 'ready',
                message: 'AI assistant is ready to help'
              }));
              
              // Send ad data context if available
              if (adData) {
                console.log('Sending ad data context to OpenAI');
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

            // Forward all OpenAI messages to client
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(data));
            }
            
          } catch (error) {
            console.error('Error processing OpenAI message:', error);
          }
        };

        openAISocket.onerror = (error) => {
          console.error('=== OPENAI WEBSOCKET ERROR ===', error);
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'OpenAI connection failed'
          }));
        };

        openAISocket.onclose = (event) => {
          console.log('=== OPENAI WEBSOCKET CLOSED ===', event.code, event.reason);
          sessionReady = false;
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
              type: 'openai_disconnected',
              message: 'OpenAI connection lost'
            }));
          }
        };

      } catch (error) {
        console.error('Error creating OpenAI WebSocket:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to connect to OpenAI'
        }));
      }
    };

    return response;

  } catch (error) {
    console.error('=== WEBSOCKET UPGRADE FAILED ===', error);
    return new Response(`WebSocket upgrade failed: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
