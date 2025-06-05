
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useTheme } from "@/context/ThemeContext";

interface VoiceAssistantProps {
  adData?: any;
}

const VoiceAssistant = ({ adData }: VoiceAssistantProps) => {
  const { theme } = useTheme();
  const {
    isListening,
    isProcessing,
    isPlaying,
    startListening,
    stopListening,
    analyzeAndRespond
  } = useVoiceAssistant();

  const handleQuickAnalysis = () => {
    analyzeAndRespond("Please analyze my ad performance and tell me which ads are doing well and which need improvement", adData);
  };

  const getStatusText = () => {
    if (isListening) return "Listening... Click to stop";
    if (isProcessing) return "Processing your question...";
    if (isPlaying) return "AI Assistant is speaking...";
    return "Click to ask about your ads";
  };

  const getStatusColor = () => {
    if (isListening) return "text-red-400";
    if (isProcessing || isPlaying) return "text-blue-400";
    return "text-gray-400";
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
          Ask me about your ad performance in simple terms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Control Button */}
        <div className="flex flex-col items-center space-y-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isPlaying}
            className={`w-16 h-16 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-zue-blue hover:bg-blue-700'
            } text-white flex items-center justify-center`}
          >
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin" />
            ) : isListening ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}
          </Button>
          
          <p className={`text-sm text-center ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>

        {/* Quick Analysis Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleQuickAnalysis}
            disabled={isListening || isProcessing || isPlaying}
            variant="outline"
            className={`w-full ${
              theme === 'light'
                ? 'border-zue-blue text-zue-blue hover:bg-zue-blue/10'
                : 'border-zue-blue text-zue-blue hover:bg-zue-blue/20'
            }`}
          >
            {isProcessing || isPlaying ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Quick Ad Analysis'
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className={`text-xs ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        } space-y-1`}>
          <p>• Click the microphone to ask questions</p>
          <p>• Try: "Which ads are performing best?"</p>
          <p>• Or: "How can I improve my campaigns?"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
