
import { Link } from "react-router-dom";

interface OnboardingHeaderProps {
  completedCount: number;
  totalCount: number;
}

const OnboardingHeader = ({ completedCount, totalCount }: OnboardingHeaderProps) => {
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="mb-8 text-center">
      <Link to="/" className="flex justify-center items-center mb-6">
        <img
          src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
          alt="Zue Co Media Logo"
          className="h-12 mr-2"
        />
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
