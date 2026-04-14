
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-zue-dark/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container-custom flex items-center justify-between py-4 px-0 mx-[20px]">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
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
            <span className={`font-bold text-2xl ${theme === 'light' ? 'text-slate-900 drop-shadow-md' : 'text-slate-50'}`}>
              Zue<span className="text-zue-blue">Co</span> Media
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#home" className="text-white hover:text-zue-blue transition-colors">Home</a>
          <a href="#services" className="text-white hover:text-zue-blue transition-colors">Services</a>
          <a href="#about" className="text-white hover:text-zue-blue transition-colors">About</a>
          <a href="#projects" className="text-white hover:text-zue-blue transition-colors">Projects</a>
          <a href="#process" className="text-white hover:text-zue-blue transition-colors">Process</a>
          <a href="#contact" className="text-white hover:text-zue-blue transition-colors">Contact</a>
          <Link to="/real-estate" className="text-white hover:text-zue-blue transition-colors">Real Estate</Link>
          <Link to="/login">
            <Button className="bg-zue-blue hover:bg-zue-blue-dark text-white ml-4 gap-2">
              <LogIn size={16} />
              Log In
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="p-2 text-white focus:outline-none">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && <div className="md:hidden bg-zue-dark-light/95 backdrop-blur-md absolute w-full">
          <div className="flex flex-col space-y-4 px-6 py-6">
            <a href="#home" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>Home</a>
            <a href="#services" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>Services</a>
            <a href="#about" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>About</a>
            <a href="#projects" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>Projects</a>
            <a href="#process" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>Process</a>
            <a href="#contact" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>Contact</a>
            <Link to="/real-estate" className="text-white hover:text-zue-blue transition-colors py-2" onClick={toggleMobileMenu}>Real Estate</Link>
            <Link to="/login" onClick={toggleMobileMenu}>
              <Button className="bg-zue-blue hover:bg-zue-blue-dark text-white w-full gap-2">
                <LogIn size={16} />
                Log In
              </Button>
            </Link>
          </div>
        </div>}
    </header>;
};

export default Navbar;

