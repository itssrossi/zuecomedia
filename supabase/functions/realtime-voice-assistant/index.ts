
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openAISocket: WebSocket | null = null;
  let adData: any = null;

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return new Response("API key not configured", { status: 500 });
  }

  // Connect to OpenAI Realtime API
  const connectToOpenAI = () => {
    console.log('Connecting to OpenAI Realtime API...');
    openAISocket = new WebSocket(
      `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`,
      ["realtime", `openai-insecure-api-key.${OPENAI_API_KEY}`]
    );

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
      
      // Send session configuration
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

      openAISocket!.send(JSON.stringify(sessionConfig));
      
      // Send initial context about the ad data
      if (adData) {
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
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('OpenAI message:', data.type);

      // Handle function calls
      if (data.type === 'response.function_call_arguments.done') {
        const args = JSON.parse(data.arguments);
        console.log('Function call args:', args);
        
        // Provide ad analysis context
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

      // Forward all other messages to client
      socket.send(JSON.stringify(data));
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'Connection to AI failed' }));
    };

    openAISocket.onclose = (event) => {
      console.log('OpenAI WebSocket closed:', event.code, event.reason);
      socket.send(JSON.stringify({ type: 'connection_closed' }));
    };
  };

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    connectToOpenAI();
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Client message type:', data.type);

    if (data.type === 'set_ad_data') {
      adData = data.adData;
      console.log('Ad data received and stored');
      return;
    }

    // Forward audio and other messages to OpenAI
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(JSON.stringify(data));
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket disconnected');
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});
