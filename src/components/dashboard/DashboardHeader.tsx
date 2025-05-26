
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/context/ThemeContext";
import MobileMenu from "./MobileMenu";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  return (
    <header className={`${theme === 'light' ? 'bg-white shadow-sm' : 'bg-zue-dark-light shadow-md'} py-4 px-6 sticky top-0 z-10 transition-colors duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {theme === 'light' ? (
            <img
              src="/lovable-uploads/c5a928fa-35df-4bf0-b39d-7b83e2cbc714.png"
              alt="Zue Co Media Light Logo"
              className="h-8"
            />
          ) : (
            <img
              src="/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png"
              alt="Zue Co Media Dark Logo"
              className="h-8"
            />
          )}
          <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            Zue<span className="text-zue-blue">Co</span> Analytics Dashboard
          </h1>
        </div>
        
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
          {isMobile ? (
            <MobileMenu />
          ) : (
            <>
              {user && (
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
