
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      console.log('Starting audio recording...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      console.log('Audio recording started successfully');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    console.log('Stopping audio recording...');
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

export const useRealtimeVoiceAssistant = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connect = useCallback(async (adData?: any) => {
    try {
      console.log('=== STARTING VOICE ASSISTANT CONNECTION ===');
      setConnectionError(null);
      
      // Initialize audio context and queue
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContext);
      console.log('Audio context initialized');

      // Try the correct Supabase WebSocket URL format
      // For Supabase edge functions, we need to use the HTTP endpoint and upgrade to WebSocket
      const baseUrl = 'https://ctwbwaznsrracvbeksqj.supabase.co/functions/v1/realtime-voice-assistant';
      console.log('Attempting to connect to:', baseUrl);
      
      // First, let's try making an HTTP request to see if the function is accessible
      try {
        const testResponse = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Upgrade': 'websocket',
            'Connection': 'Upgrade',
            'Sec-WebSocket-Key': btoa(Math.random().toString()).substring(0, 24),
            'Sec-WebSocket-Version': '13'
          }
        });
        console.log('Test response status:', testResponse.status);
        console.log('Test response headers:', Object.fromEntries(testResponse.headers.entries()));
      } catch (testError) {
        console.error('Test request failed:', testError);
        setConnectionError('Edge function not accessible: ' + testError.message);
        return;
      }

      // Now try WebSocket connection
      const wsUrl = baseUrl.replace('https://', 'wss://');
      console.log('WebSocket URL:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('=== WEBSOCKET CONNECTION OPENED ===');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Send ad data if provided
        if (adData && wsRef.current) {
          console.log('Sending ad data to assistant');
          wsRef.current.send(JSON.stringify({
            type: 'set_ad_data',
            adData
          }));
        }

        // Start recording after connection is established
        startRecording();
        toast.success("Voice assistant connected! Start speaking...");
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data.type);

          if (data.type === 'response.audio.delta') {
            setIsAISpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
          } else if (data.type === 'response.audio.done') {
            setIsAISpeaking(false);
          } else if (data.type === 'session.created') {
            console.log('Session created successfully');
          } else if (data.type === 'session.updated') {
            console.log('Session configuration updated');
          } else if (data.type === 'error') {
            console.error('WebSocket error from server:', data);
            setConnectionError(data.message || 'Server error');
            toast.error(`Assistant error: ${data.message}`);
          } else if (data.type === 'connection_test') {
            console.log('Connection test successful:', data.message);
          } else if (data.type === 'connection_closed') {
            console.log('OpenAI connection closed:', data);
            setConnectionError(`AI connection closed: ${data.reason || 'Unknown reason'}`);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('=== WEBSOCKET ERROR ===', error);
        setConnectionError('WebSocket connection failed - check edge function deployment');
        toast.error("Connection error. The voice assistant service may not be deployed.");
        setIsConnected(false);
        setIsListening(false);
        setIsAISpeaking(false);
      };

      wsRef.current.onclose = (event) => {
        console.log('=== WEBSOCKET CLOSED ===');
        console.log('Close code:', event.code, 'Reason:', event.reason);
        setIsConnected(false);
        setIsListening(false);
        setIsAISpeaking(false);
        
        // Handle different close codes
        if (event.code === 1006) {
          setConnectionError('Connection failed - edge function may not be deployed or accessible');
          toast.error("Unable to connect to voice assistant. Please check if the service is deployed.");
        } else if (event.code !== 1000) {
          setConnectionError(`Connection closed: ${event.reason || 'Unknown error'}`);
          toast.error("Connection lost. Please try reconnecting.");
        }
      };

    } catch (error) {
      console.error('Error connecting to voice assistant:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      toast.error("Failed to connect to voice assistant. Please try again.");
    }
  }, [reconnectAttempts]);

  const startRecording = async () => {
    try {
      console.log('Starting audio recording...');
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64Audio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      });

      await recorderRef.current.start();
      setIsListening(true);
      console.log('Audio recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      setConnectionError('Microphone access denied');
      toast.error("Could not access microphone. Please check permissions and try again.");
    }
  };

  const disconnect = useCallback(() => {
    console.log('=== DISCONNECTING VOICE ASSISTANT ===');
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    recorderRef.current?.stop();
    wsRef.current?.close(1000, 'User disconnected');
    setIsConnected(false);
    setIsListening(false);
    setIsAISpeaking(false);
    setConnectionError(null);
    setReconnectAttempts(0);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isListening,
    isAISpeaking,
    connectionError,
    connect,
    disconnect
  };
};
