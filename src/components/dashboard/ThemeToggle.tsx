
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle animation state
  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`relative ${theme === 'light' ? 'bg-yellow-100' : 'bg-slate-800'} transition-colors duration-300`}
      onClick={handleToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Lightbulb 
        className={`
          ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}
          ${isAnimating ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
        size={18}
        strokeWidth={theme === 'light' ? 2.5 : 1.5}
      />
      {isAnimating && (
        <span className={`absolute inset-0 rounded-full ${theme === 'light' ? 'animate-ping bg-yellow-400/20' : 'animate-ping bg-gray-400/20'}`}></span>
      )}
    </Button>
  );
};

export default ThemeToggle;
