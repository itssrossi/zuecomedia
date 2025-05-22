
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

interface OnboardingHeaderProps {
  completedCount: number;
  totalCount: number;
}

const OnboardingHeader = ({ completedCount, totalCount }: OnboardingHeaderProps) => {
  const progress = Math.round((completedCount / totalCount) * 100);
  const { theme } = useTheme();

  return (
    <header className="mb-8 text-center">
      <Link to="/" className="flex justify-center items-center mb-6">
        {theme === 'light' ? (
          <img
            src="/lovable-uploads/c5a928fa-35df-4bf0-b39d-7b83e2cbc714.png"
            alt="Zue Co Media Light Logo"
            className="h-12 mr-2"
          />
        ) : (
          <img
            src="/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png"
            alt="Zue Co Media Dark Logo"
            className="h-12 mr-2"
          />
        )}
        <span className="font-bold text-2xl">
          Zue<span className="text-zue-blue">Co</span> Media
        </span>
      </Link>
      <h1 className="text-3xl font-bold mb-2">Welcome to Zue Co Media!</h1>
      <p className="text-lg text-gray-300 mb-4">
        Complete these steps to set up your account and get started with our services.
      </p>
      <div className="bg-zue-dark-light rounded-full h-4 w-full mb-2 overflow-hidden">
        <div 
          className="bg-zue-blue h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-300">{completedCount} of {totalCount} tasks completed ({progress}%)</p>
    </header>
  );
};

export default OnboardingHeader;
