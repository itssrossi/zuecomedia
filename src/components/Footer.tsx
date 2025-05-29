import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
const Footer = () => {
  const {
    theme
  } = useTheme();
  return <footer className="bg-zue-dark border-t border-white/10">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <a href="/" className="inline-block mb-4 flex items-center">
              {theme === 'light' ? <img src="/lovable-uploads/c5a928fa-35df-4bf0-b39d-7b83e2cbc714.png" alt="Zue Co Media Light Logo" className="h-10 mr-2" /> : <img src="/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png" alt="Zue Co Media Dark Logo" className="h-10 mr-2" />}
              <span className="font-bold text-2xl text-white">Zue<span className="text-zue-blue">Co</span> Media</span>
            </a>
            <p className="text-gray-400 mb-6">
              Elevating brands through strategic marketing and creative solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/zuecomedia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-zue-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/zuecomedia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-zue-blue transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-zue-blue transition-colors">
                
              </a>
              <a href="#" className="text-gray-400 hover:text-zue-blue transition-colors">
                
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="text-gray-400 hover:text-zue-blue transition-colors">Brand Identity</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-zue-blue transition-colors">Marketing</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-zue-blue transition-colors">SEO Optimization</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-zue-blue transition-colors">Web Development</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-zue-blue transition-colors">About Us</a></li>
              <li><a href="#projects" className="text-gray-400 hover:text-zue-blue transition-colors">Projects</a></li>
              <li><a href="#" className="text-gray-400 hover:text-zue-blue transition-colors">Careers</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-zue-blue transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-zue-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-zue-blue transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-zue-blue transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Zue Co Media. All rights reserved.
          </p>
          <div className="text-sm text-gray-400">
            <a href="#" className="hover:text-zue-blue">Privacy Policy</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-zue-blue">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;