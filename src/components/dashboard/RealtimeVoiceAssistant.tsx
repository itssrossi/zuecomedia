
import { Volume2, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeVoiceAssistant } from "@/hooks/useRealtimeVoiceAssistant";
import { useTheme } from "@/context/ThemeContext";

interface RealtimeVoiceAssistantProps {
  adData?: any;
}

const RealtimeVoiceAssistant = ({ adData }: RealtimeVoiceAssistantProps) => {
  const { theme } = useTheme();
  const {
    isConnected,
    isListening,
    isAISpeaking,
    connect,
    disconnect
  } = useRealtimeVoiceAssistant();

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect(adData);
    }
  };

  const getStatusText = () => {
    if (!isConnected) return "Connect to start talking";
    if (isAISpeaking) return "AI is speaking...";
    if (isListening) return "Listening... Ask me anything!";
    return "Connected - Ready to help";
  };

  const getStatusColor = () => {
    if (!isConnected) return "text-gray-400";
    if (isAISpeaking) return "text-blue-400";
    if (isListening) return "text-green-400";
    return "text-zue-blue";
  };

  return (
    <Card className={`${
      theme === 'light' 
        ? 'bg-white border-gray-200' 
        : 'bg-zue-dark-light border-gray-800'
    } shadow-md`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          <Volume2 size={20} className="text-zue-blue" />
          AI Voice Assistant
        </CardTitle>
        <CardDescription className={
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }>
          Ask me anything about your ads - I'll respond with voice immediately!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Control Button */}
        <div className="flex flex-col items-center space-y-3">
          <Button
            onClick={handleToggleConnection}
            className={`w-16 h-16 rounded-full ${
              isConnected 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-zue-blue hover:bg-blue-700'
            } text-white flex items-center justify-center`}
          >
            {isAISpeaking ? (
              <Loader2 size={24} className="animate-spin" />
            ) : isConnected ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}
          </Button>
          
          <p className={`text-sm text-center ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>

        {/* Instructions */}
        <div className={`text-xs ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        } space-y-1`}>
          <p>• Click to connect and start talking</p>
          <p>• Ask: "Which ads are performing best?"</p>
          <p>• Or: "How can I improve my campaigns?"</p>
          <p>• Voice responses are immediate!</p>
        </div>

        {/* Connection Status Indicator */}
        {isConnected && (
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isAISpeaking ? 'bg-blue-400 animate-pulse' :
              isListening ? 'bg-green-400 animate-pulse' : 'bg-zue-blue'
            }`}></div>
            <span className="text-xs text-gray-400">
              {isAISpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeVoiceAssistant;
