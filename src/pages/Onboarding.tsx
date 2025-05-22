
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Json } from "@/integrations/supabase/types";

interface ChecklistItem {
  id: number;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  completed: boolean;
}

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: "Join WhatsApp Group",
      description: "Connect with our community and get instant support.",
      link: "https://chat.whatsapp.com/GFOQuBEEEIaFMeQwN48Ui5",
      linkText: "Join WhatsApp Group",
      completed: false,
    },
    {
      id: 2,
      title: "Target Audience Analysis",
      description: "Complete our form to help identify your ideal target audience.",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSeY6bISe9j3ZSb8_KYfKnW-ve1E24QAKbCE55ML0XuQzNhA1A/viewform",
      linkText: "Complete Analysis Form",
      completed: false,
    },
    {
      id: 3,
      title: "Create a Facebook Business Manager",
      description: "Set up your Facebook Business Manager account.",
      link: "https://business.facebook.com/overview",
      linkText: "Create Business Manager",
      completed: false,
    },
    {
      id: 4,
      title: "Create a Facebook Page",
      description: "If you don't have one already, create your Facebook page.",
      link: "https://www.facebook.com/pages/create",
      linkText: "Create Facebook Page",
      completed: false,
    },
    {
      id: 5,
      title: "Link Instagram",
      description: "In Business Settings, go to 'Instagram Accounts' and link your IG business account.",
      completed: false,
    },
    {
      id: 6,
      title: "Create Ad Account",
      description: "In Business Settings > Ad Accounts > Add > Create a new Ad Account.",
      completed: false,
    },
    {
      id: 7,
      title: "Add Payment Method",
      description: "Go to Payment Settings and add a credit card. Do not use PayPal.",
      completed: false,
    },
    {
      id: 8,
      title: "Meta Pixel",
      description: "We'll provide the landing page URL for setting this up. Wait for our team to assist.",
      completed: false,
    },
    {
      id: 9,
      title: "Add Business Info",
      description: "Complete business details under Settings (e.g., name, address, timezone).",
      completed: false,
    },
    {
      id: 10,
      title: "Add Zue Co Media as a Partner",
      description: "In Business Settings > Users > Partners > Add ID: 186154760906782. Grant access to Pages, Ad Accounts, Pixels, etc.",
      completed: false,
    },
  ]);
  
  // Load saved onboarding progress
  useEffect(() => {
    const loadOnboardingProgress = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('onboarding_data')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        if (data && data.onboarding_data) {
          // Type assertion to handle Json type
          const savedData = data.onboarding_data as unknown as ChecklistItem[];
          
          if (Array.isArray(savedData)) {
            setChecklistItems(prevItems => {
              return prevItems.map(item => {
                const savedItem = savedData.find(i => i.id === item.id);
                return savedItem ? { ...item, completed: savedItem.completed } : item;
              });
            });
          }
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      }
    };
    
    loadOnboardingProgress();
  }, [user]);

  const toggleItem = async (id: number) => {
    const updatedItems = checklistItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);
    
    // Save progress to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_onboarding')
          .upsert({
            user_id: user.id,
            onboarding_data: updatedItems as unknown as Json,
            completed: updatedItems.every(item => item.completed)
          });
          
        if (error) throw error;
      } catch (error) {
        console.error('Error saving onboarding progress:', error);
      }
    }
  };

  const handleComplete = () => {
    const allCompleted = checklistItems.every(item => item.completed);
    
    if (allCompleted) {
      // Redirect to Facebook account setup page when all tasks are completed
      navigate("/dashboard/facebook-setup");
      toast.success("Onboarding completed! Let's connect your Facebook Ad Account.");
    } else {
      // Continue to dashboard if not all tasks are completed
      navigate("/dashboard");
      toast.info("You can complete the remaining tasks later.");
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="min-h-screen bg-zue-dark text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <Link to="/" className="flex justify-center items-center mb-6">
            <img
              src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
              alt="Zue Co Media Logo"
              className="h-12 mr-2"
            />
            <span className="font-bold text-2xl">
              Zue<span className="text-zue-blue">Co</span> Media
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome to Zue Co Media!</h1>
          <p className="text-lg text-gray-300 mb-4">
            Complete these steps to set up your account and get started with our services.
          </p>
          <div className="bg-zue-dark-light rounded-full h-4 w-full mb-2 overflow-hidden">
            <div 
              className="bg-zue-blue h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300">{completedCount} of {checklistItems.length} tasks completed ({progress}%)</p>
        </header>

        <div className="space-y-4">
          {checklistItems.map((item) => (
            <Card key={item.id} className="bg-zue-dark-light border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3">
                  <Checkbox 
                    id={`task-${item.id}`}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="h-5 w-5"
                  />
                  <label 
                    htmlFor={`task-${item.id}`}
                    className={`text-xl cursor-pointer ${item.completed ? 'line-through text-gray-400' : ''}`}
                  >
                    {item.title}
                  </label>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-3">{item.description}</p>
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zue-blue hover:text-zue-blue-light"
                  >
                    <ExternalLink size={16} />
                    {item.linkText || "Open Link"}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          
          <Button 
            variant="default"
            className="bg-zue-blue hover:bg-zue-blue-dark text-white"
            onClick={handleComplete}
          >
            {progress === 100 ? "Complete Onboarding" : "Continue to Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
