
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const goToOnboarding = () => {
    navigate('/onboarding');
  };

  return (
    <header className={`${theme === 'light' ? 'bg-white shadow-sm' : 'bg-zue-dark-light shadow-md'} py-4 px-6 sticky top-0 z-10 transition-colors duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
            alt="Zue Co Media Logo"
            className="h-8"
          />
          <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            Zue<span className="text-zue-blue">Co</span> Analytics Dashboard
          </h1>
        </div>
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
          <ThemeToggle />
          <Button
            variant="outline"
            className={`
              ${theme === 'light' 
                ? 'border-zue-blue text-gray-800 hover:bg-zue-blue/10' 
                : 'border-zue-blue text-white hover:bg-zue-blue/20'}
              flex items-center gap-2
            `}
            onClick={goToOnboarding}
          >
            <CheckCircle size={16} />
            {isMobile ? '' : 'Onboarding Checklist'}
          </Button>
          {user && !isMobile && (
            <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              {user.email}
            </span>
          )}
          <Button
            variant="outline"
            className={`
              ${theme === 'light' 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                : 'border-gray-600 text-white hover:bg-zue-dark'}
              hover:text-white
            `}
            onClick={signOut}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
