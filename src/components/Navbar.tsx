
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <img 
              src="/lovable-uploads/1f60c519-5cc4-433f-959d-216e2788bfb0.png" 
              alt="Zue Co Media Logo" 
              className="h-12 mr-2"
            />
            <span className="font-bold text-2xl text-white">Zue<span className="text-zue-blue">Co</span> Media</span>
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
          <Button className="bg-zue-blue hover:bg-zue-blue-dark text-white ml-4">Get Started</Button>
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
            <Button className="bg-zue-blue hover:bg-zue-blue-dark text-white w-full">Get Started</Button>
          </div>
        </div>}
    </header>;
};

export default Navbar;
