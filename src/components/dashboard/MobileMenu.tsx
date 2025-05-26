
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleOnboarding = () => {
    navigate("/onboarding");
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`
            ${theme === 'light' 
              ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
              : 'border-gray-600 text-white hover:bg-zue-dark'}
          `}
        >
          <Menu size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className={`w-64 ${theme === 'light' ? 'bg-white' : 'bg-zue-dark-light'}`}
      >
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
              Theme
            </span>
            <ThemeToggle />
          </div>

          <Button
            variant="outline"
            className={`
              w-full justify-start gap-2
              ${theme === 'light' 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                : 'border-gray-600 text-white hover:bg-zue-dark'}
            `}
            onClick={handleOnboarding}
          >
            <BookOpen size={16} />
            Onboarding
          </Button>

          <Button
            variant="outline"
            className={`
              w-full justify-start gap-2
              ${theme === 'light' 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                : 'border-gray-600 text-white hover:bg-zue-dark'}
            `}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
