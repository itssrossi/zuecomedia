import { Check } from "lucide-react";
const About = () => {
  const stats = [{
    value: "25.4M+",
    label: "Campaign Reach"
  }, {
    value: "13.7",
    label: "Years in Business"
  }, {
    value: "25",
    label: "Team Members"
  }, {
    value: "34M+",
    label: "Revenue Generated"
  }];
  return <section id="about" className="section bg-zue-dark-light">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Vision, attention to detail, and passion for a flawless 
              <span className="text-zue-blue"> final product.</span>
            </h2>
            
            <p className="text-gray-300 mb-6">
              At Zue Co Media, we're more than just a marketing agency. We're your strategic partner in navigating 
              the digital landscape. Our team combines creativity, technology, and data-driven insights to deliver 
              exceptional results that drive your business forward.
            </p>
            
            <div className="space-y-3 mb-8">
              {["Results-driven strategies tailored to your goals", "Creative solutions that make your brand stand out", "Data-backed decisions for maximum ROI", "Dedicated team of industry experts"].map((item, index) => <div key={index} className="flex items-start">
                  <div className="bg-zue-blue rounded-full p-1 mr-3 mt-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-900">{item}</span>
                </div>)}
            </div>
            
            <p className="font-medium text-lg">
              Using <span className="text-zue-blue">design, technology, and marketing</span>, we help shape 
              Digital Brand Experiences that propel your success in the digital realm.
            </p>
          </div>
          
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            {stats.map((stat, index) => <div key={index} className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-bold text-zue-blue mb-2">{stat.value}</span>
                <span className="text-gray-300 text-sm">{stat.label}</span>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default About;