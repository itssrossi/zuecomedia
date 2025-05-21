
import { AreaChart, Layers, Code, Megaphone, PenTool, LineChart, ArrowRight } from "lucide-react";

const services = [
  {
    icon: <PenTool className="h-8 w-8 text-zue-blue mb-4" />,
    title: "Brand Identity",
    description: "Create a unique and memorable brand with our comprehensive identity services including logo design, brand guidelines, and visual assets."
  },
  {
    icon: <Megaphone className="h-8 w-8 text-zue-blue mb-4" />,
    title: "Marketing",
    description: "Engage your audience with targeted campaigns across multiple channels including social media, email, and content marketing."
  },
  {
    icon: <LineChart className="h-8 w-8 text-zue-blue mb-4" />,
    title: "SEO Optimization",
    description: "Improve your online visibility and rank higher in search engine results with our proven optimization strategies."
  },
  {
    icon: <Code className="h-8 w-8 text-zue-blue mb-4" />,
    title: "Web Development",
    description: "Build responsive, user-friendly websites that convert visitors into customers with our expert development team."
  },
  {
    icon: <Layers className="h-8 w-8 text-zue-blue mb-4" />,
    title: "UI/UX Design",
    description: "Enhance user experience with intuitive interfaces and seamless interactions designed to maximize engagement."
  },
  {
    icon: <AreaChart className="h-8 w-8 text-zue-blue mb-4" />,
    title: "Analytics & Insights",
    description: "Make data-driven decisions with comprehensive analytics and reporting to measure and improve campaign performance."
  }
];

const Services = () => {
  return (
    <section id="services" className="section bg-zue-dark relative">
      <div className="absolute inset-0 bg-gradient-to-br from-zue-blue/5 to-transparent z-0" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our <span className="text-zue-blue">Services</span></h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We provide end-to-end digital solutions to help your business grow and thrive in today's competitive landscape.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="service-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {service.icon}
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-300 flex-grow">{service.description}</p>
              <a 
                href="#contact" 
                className="inline-flex items-center mt-4 text-zue-blue hover:text-zue-blue-light font-medium"
              >
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
