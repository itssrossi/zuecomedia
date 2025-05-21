
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

const Index = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Update page title
    document.title = "Zue Co Media - Digital Marketing & Brand Solutions";
  }, []);

  return (
    <div className="min-h-screen bg-zue-dark text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Projects />
      <Process />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
