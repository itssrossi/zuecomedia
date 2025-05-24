
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/book-meeting');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <section id="home" className="min-h-screen bg-zue-dark flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zue-blue/10 to-transparent z-0" style={{
        backgroundImage: "radial-gradient(circle at 25% 10%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)"
      }} />
      
      <div className="container-custom relative z-10 pt-28">
        <div className="flex flex-col items-center text-center md:text-left md:items-start">
          <div className="inline-block bg-zue-blue/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <p className="text-sm font-medium text-white">
              <span className="mr-2 inline-block w-2 h-2 bg-zue-blue rounded-full"></span>
              Digital Marketing Solutions
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:max-w-2xl animate-fade-in px-0 mx-[10px]">
            Elevate <span className="text-zue-blue">your brand</span> with creative marketing excellence
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl opacity-90">
            Creative consultancy crafting successful brands and experiences that resonate with your audience and drive results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="bg-zue-blue hover:bg-zue-blue-dark text-white px-6 py-6 text-lg rounded-lg light-mode:shadow-lg"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 hover:bg-white/10 text-white px-6 py-6 text-lg rounded-lg light-mode:shadow-lg"
              onClick={handleLogin}
            >
              Login
              <LogIn className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-8">
          {['Brand', 'Design', 'Strategy', 'Technology', 'Campaigns', 'Analytics'].map((item, index) => (
            <div 
              key={index} 
              style={{
                animationDelay: `${index * 0.1}s`
              }} 
              className="flex items-center justify-center p-4 bg-zue-dark-light/50 backdrop-blur-sm rounded-lg border border-white/10 animate-fade-in mx-[10px]"
            >
              <span className="text-white font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
