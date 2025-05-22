
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const goToOnboarding = () => {
    navigate('/onboarding');
  };

  return (
    <header className="bg-zue-dark-light shadow-md py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
            alt="Zue Co Media Logo"
            className="h-8"
          />
          <h1 className="text-xl font-bold">
            Zue<span className="text-zue-blue">Co</span> Analytics Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-zue-blue text-white hover:bg-zue-blue/20 flex items-center gap-2"
            onClick={goToOnboarding}
          >
            <CheckCircle size={16} />
            Onboarding Checklist
          </Button>
          {user && (
            <span className="text-sm text-gray-300">
              {user.email}
            </span>
          )}
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-zue-dark hover:text-white"
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
