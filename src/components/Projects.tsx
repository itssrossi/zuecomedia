
import { ArrowUpRight } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const fullTestimonial = `Working with Zueco Media showed me what real performance marketing looks like.

We launched Link2Pay with zero brand presence, no previous users, and no existing audience — yet within the first 30 days, Zueco Media acquired over 49 new trial users for our platform.

The campaign was data-driven from the start. They tested multiple creatives, refined messaging, and optimized our sign-up funnel based on real user behavior. Our best-performing ads generated incredibly strong click-through rates and a cost-per-trial that proved there is genuine market demand for our product.

Even though our conversion from trial to paid users didn't hit where we expected, the data clearly showed the issue was with our onboarding process — not the marketing. Zueco Media delivered exactly what they promised: predictable user acquisition and validated demand.

If you're trying to launch a SaaS or acquire real users quickly, Zueco Media isn't just an ad agency — they're a strategic growth partner who understands product, funnels, and performance at a deep level.`;

const projects = [
  {
    title: "Link2Pay - SaaS",
    category: "Performance Marketing • User Acquisition",
    description: "Working with Zueco Media showed me what real performance marketing looks like.",
    image: "/images/link2pay-thumbnail.png",
    pdfLink: "/documents/link2pay-testimonial.pdf",
    hasTestimonial: true,
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

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const cardContent = (
    <div 
      className="bg-zue-card-dark rounded-lg overflow-hidden border border-zue-dark-light card-hover group cursor-pointer"
    >
      <div 
        className="h-48 bg-gradient-to-br from-zue-blue/30 to-zue-dark-light flex items-end p-6 relative"
        style={{ 
          backgroundImage: project.image 
            ? `url(${project.image})` 
            : `linear-gradient(to bottom right, rgba(14, 165, 233, 0.2), rgba(15, 23, 42, 0.9))`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
  );

  if (project.hasTestimonial) {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <a 
            href={project.pdfLink} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {cardContent}
          </a>
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-96 bg-zue-card-dark border-zue-dark-light text-white p-4"
          side="right"
          align="start"
        >
          <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
            {fullTestimonial}
          </p>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return cardContent;
};

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
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
