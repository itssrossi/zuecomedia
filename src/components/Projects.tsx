
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Oceanic Web Development",
    category: "Website • Branding • E-commerce",
    description: "Redesigned website with improved user experience and conversion rate optimization."
  },
  {
    title: "Retro Academy Consulting",
    category: "Marketing • Strategy • SEO",
    description: "Comprehensive digital marketing campaign that increased organic traffic by 150%."
  },
  {
    title: "Path Branding",
    category: "Branding • Design • Strategy",
    description: "Complete brand identity overhaul for a growing tech startup."
  },
  {
    title: "SaaS Mobile Application",
    category: "UI/UX • Development • Product",
    description: "Mobile app development for a subscription-based service with integrated payment system."
  },
  {
    title: "University SEO Strategy",
    category: "SEO • Content • Analytics",
    description: "Implemented SEO strategy that doubled organic search visibility within 6 months."
  },
  {
    title: "Creative Accounting Firm",
    category: "Branding • Website • Print Design",
    description: "Brand positioning and website design for an accounting firm targeting creative professionals."
  }
];

const Projects = () => {
  return (
    <section id="projects" className="section bg-zue-dark">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Projects <span className="text-zue-blue">we are proud of</span>
        </h2>
        <p className="text-gray-300 mb-12 max-w-2xl">
          Our portfolio showcases successful collaborations with brands across various industries, 
          delivering results that exceed expectations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="bg-zue-card-dark rounded-lg overflow-hidden border border-zue-dark-light card-hover group"
            >
              <div 
                className="h-48 bg-gradient-to-br from-zue-blue/30 to-zue-dark-light flex items-end p-6"
                style={{ 
                  backgroundImage: `linear-gradient(to bottom right, rgba(14, 165, 233, 0.2), rgba(15, 23, 42, 0.9))` 
                }}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-full p-2">
                    <ArrowUpRight className="h-4 w-4 text-zue-dark" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400 mb-2">{project.category}</div>
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
