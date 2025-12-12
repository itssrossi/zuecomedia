
import { Search, PenTool, Zap, Rocket } from "lucide-react";

const Process = () => {
  const steps = [
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: "Discovery",
      description: "We learn about your business, goals, target audience, and competitors to create a strategic foundation."
    },
    {
      icon: <PenTool className="h-6 w-6 text-white" />,
      title: "Design",
      description: "Our creative team develops concepts and design elements tailored to your brand's unique identity and objectives."
    },
    {
      icon: <Zap className="h-6 w-6 text-white" />,
      title: "Development",
      description: "We build robust, scalable client acquisition solutions implementing your designs with cutting-edge technology and best practices."
    },
    {
      icon: <Rocket className="h-6 w-6 text-white" />,
      title: "Delivery",
      description: "We launch your project, provide training and support, and ensure everything meets our high quality standards."
    }
  ];
  
  return (
    <section id="process" className="section bg-zue-dark-light">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Our <span className="text-zue-blue">Process</span>
        </h2>
        <p className="text-gray-300 text-center mb-16 max-w-2xl mx-auto">
          We follow a structured approach to ensure every project is delivered on time, 
          within budget, and exceeds expectations.
        </p>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-zue-blue/30 transform -translate-x-1/2 hidden md:block" />
          
          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Visible only on medium+ screens */}
                <div className={`hidden md:flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark inline-block card-hover">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-zue-blue rounded-full p-3 z-10">
                    {step.icon}
                  </div>
                </div>
                
                {/* Visible only on small screens */}
                <div className="md:hidden flex flex-col items-center">
                  <div className="bg-zue-blue rounded-full p-3 mb-4">
                    {step.icon}
                  </div>
                  
                  <div className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark w-full text-center card-hover">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
