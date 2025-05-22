
import { Button } from "@/components/ui/button";

interface OnboardingActionsProps {
  progress: number;
  onComplete: () => void;
  onBack: () => void;
}

const OnboardingActions = ({ progress, onComplete, onBack }: OnboardingActionsProps) => {
  return (
    <div className="mt-8 flex justify-between">
      <Button 
        variant="outline" 
        onClick={onBack}
      >
        Back
      </Button>
      
      <Button 
        variant="default"
        className="bg-zue-blue hover:bg-zue-blue-dark text-white"
        onClick={onComplete}
      >
        {progress === 100 ? "Complete & Go to Dashboard" : "Continue"}
      </Button>
    </div>
  );
};

export default OnboardingActions;
