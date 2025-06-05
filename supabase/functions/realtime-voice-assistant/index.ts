import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, UPGRADE',
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Check authorization for WebSocket connections via URL query parameter
  const url = new URL(req.url);
  const isTestRequest = req.method === 'GET' && !req.headers.get("upgrade");
  
  if (!isTestRequest) {
    const authToken = url.searchParams.get('auth');
    const expectedToken = "lovable-voice-assistant-12345";
    
    if (authToken !== expectedToken) {
      console.log('Authorization failed. Expected:', expectedToken, 'Got:', authToken);
      return new Response(JSON.stringify({ 
        code: 401, 
        message: "Unauthorized - missing or invalid auth token in URL",
        expected: "?auth=lovable-voice-assistant-12345"
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    console.log('Authorization successful via query parameter');
  }

  // Handle GET requests (for testing)
  if (req.method === 'GET') {
    const upgradeHeader = req.headers.get("upgrade") || "";
    
    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log('GET request - returning test response');
      return new Response(JSON.stringify({ 
        status: 'Voice Assistant Edge Function is running',
        timestamp: new Date().toISOString(),
        message: 'Function is public and accessible',
        auth: 'Auth token required in URL query parameter for WebSocket connections'
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Check for WebSocket upgrade
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log('Not a WebSocket request, upgrade header:', upgradeHeader);
    return new Response(JSON.stringify({
      error: "WebSocket upgrade required",
      headers: Object.fromEntries(req.headers.entries())
    }), { 
      status: 426,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Upgrade': 'websocket' }
    });
  }

  // Check OpenAI API key
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found in environment variables');
    return new Response(JSON.stringify({ 
      error: "OpenAI API key not configured",
      available_env_vars: Object.keys(Deno.env.toObject())
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('OpenAI API key found, proceeding with WebSocket upgrade');

  try {
    console.log('=== UPGRADING TO WEBSOCKET ===');
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;
    let adData: any = null;
    let sessionReady = false;

    socket.onopen = () => {
      console.log('=== CLIENT WEBSOCKET CONNECTED ===');
      
      // Send immediate connection confirmation
      try {
        socket.send(JSON.stringify({ 
          type: 'connection_established',
          status: 'connected',
          timestamp: new Date().toISOString(),
          message: 'Edge function WebSocket connection successful'
        }));
        console.log('Connection confirmation sent');
      } catch (error) {
        console.error('Error sending connection confirmation:', error);
      }
      
      // Connect to OpenAI
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
          socket.send(JSON.stringify({ 
            type: 'ad_data_received',
            status: 'success'
          }));
          return;
        }

        // Forward to OpenAI if ready
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN && sessionReady) {
          console.log('Forwarding to OpenAI:', data.type);
          openAISocket.send(JSON.stringify(data));
        } else {
          console.log('OpenAI not ready - socket state:', openAISocket?.readyState, 'session ready:', sessionReady);
          socket.send(JSON.stringify({ 
            type: 'warning', 
            message: 'OpenAI connection not ready yet'
          }));
        }
      } catch (error) {
        console.error('Error processing client message:', error);
        try {
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to process message: ' + error.message
          }));
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
      }
    };

    socket.onclose = (event) => {
      console.log('=== CLIENT DISCONNECTED ===', event.code, event.reason);
      if (openAISocket) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('=== CLIENT SOCKET ERROR ===', error);
    };

    const connectToOpenAI = async () => {
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
          try {
            socket.send(JSON.stringify({ 
              type: 'openai_connected',
              status: 'connected',
              message: 'OpenAI Realtime API connected successfully'
            }));
          } catch (error) {
            console.error('Error sending OpenAI connected message:', error);
          }
        };

        openAISocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('=== OPENAI MESSAGE ===', data.type);

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
              
              try {
                socket.send(JSON.stringify({ 
                  type: 'session_ready',
                  status: 'ready',
                  message: 'AI assistant is ready to chat'
                }));
              } catch (error) {
                console.error('Error sending session ready:', error);
              }
              
              // Send ad data context if available
              if (adData) {
                console.log('Sending ad data context to OpenAI');
                try {
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
                } catch (error) {
                  console.error('Error sending ad data context:', error);
                }
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
          console.error('=== OPENAI ERROR ===', error);
          try {
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'OpenAI connection failed: ' + error.toString()
            }));
          } catch (sendError) {
            console.error('Error sending OpenAI error:', sendError);
          }
        };

        openAISocket.onclose = (event) => {
          console.log('=== OPENAI CLOSED ===', event.code, event.reason);
          sessionReady = false;
          try {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ 
                type: 'openai_disconnected',
                code: event.code,
                reason: event.reason,
                message: 'OpenAI connection closed'
              }));
            }
          } catch (error) {
            console.error('Error sending disconnection message:', error);
          }
        };

      } catch (error) {
        console.error('Error creating OpenAI WebSocket:', error);
        try {
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to connect to OpenAI: ' + error.message
          }));
        } catch (sendError) {
          console.error('Error sending connection error:', sendError);
        }
      }
    };

    return response;

  } catch (error) {
    console.error('=== WEBSOCKET UPGRADE FAILED ===', error);
    return new Response(JSON.stringify({ 
      error: `WebSocket upgrade failed: ${error.message}`,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
