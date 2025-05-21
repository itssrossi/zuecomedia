
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the form data to your backend
    // For now we'll just show a console message
    alert("Thanks for contacting Zue Co Media! We'll be in touch soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };
  
  return (
    <section id="contact" className="section bg-zue-dark">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let's talk about <span className="text-zue-blue">your project</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Ready to elevate your brand? Contact us today to discuss how we can help you achieve your marketing goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark-light">
              <div className="flex items-start">
                <div className="bg-zue-blue/20 p-3 rounded-lg mr-4">
                  <Mail className="h-6 w-6 text-zue-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-gray-300 mb-2">Our friendly team is here to help</p>
                  <a href="mailto:hello@zueco.media" className="text-zue-blue hover:underline">hello@zueco.media</a>
                </div>
              </div>
            </div>
            
            <div className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark-light">
              <div className="flex items-start">
                <div className="bg-zue-blue/20 p-3 rounded-lg mr-4">
                  <Phone className="h-6 w-6 text-zue-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p className="text-gray-300 mb-2">Mon-Fri from 8am to 5pm</p>
                  <a href="tel:+15555555555" className="text-zue-blue hover:underline">+1 (555) 555-5555</a>
                </div>
              </div>
            </div>
            
            <div className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark-light">
              <div className="flex items-start">
                <div className="bg-zue-blue/20 p-3 rounded-lg mr-4">
                  <MapPin className="h-6 w-6 text-zue-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visit Us</h3>
                  <p className="text-gray-300 mb-2">Come say hello at our office</p>
                  <p className="text-zue-blue">123 Marketing St, Digital City</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-zue-card-dark p-6 rounded-lg border border-zue-dark-light">
              <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-zue-dark-light border border-zue-dark rounded-lg focus:ring-2 focus:ring-zue-blue focus:border-transparent outline-none text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-zue-dark-light border border-zue-dark rounded-lg focus:ring-2 focus:ring-zue-blue focus:border-transparent outline-none text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 bg-zue-dark-light border border-zue-dark rounded-lg focus:ring-2 focus:ring-zue-blue focus:border-transparent outline-none text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 bg-zue-dark-light border border-zue-dark rounded-lg focus:ring-2 focus:ring-zue-blue focus:border-transparent outline-none text-white"
                  required
                ></textarea>
              </div>
              
              <Button type="submit" className="w-full bg-zue-blue hover:bg-zue-blue-dark text-white py-6">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
