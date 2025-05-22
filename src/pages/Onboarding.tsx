
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Json } from "@/integrations/supabase/types";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import ChecklistContainer from "@/components/onboarding/ChecklistContainer";
import OnboardingActions from "@/components/onboarding/OnboardingActions";
import { ChecklistItemType } from "@/components/onboarding/ChecklistItem";

const Onboarding = () => {
  const { user, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [checklistItems, setChecklistItems] = useState<ChecklistItemType[]>([
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
          const savedData = data.onboarding_data as unknown as ChecklistItemType[];
          
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
        const allCompleted = updatedItems.every(item => item.completed);
        
        const { error } = await supabase
          .from('user_onboarding')
          .upsert({
            user_id: user.id,
            onboarding_data: updatedItems as unknown as Json,
            completed: allCompleted
          });
          
        if (error) throw error;
        
        // Update the onboarding status in Auth context
        if (allCompleted) {
          await checkOnboardingStatus(user.id);
        }
      } catch (error) {
        console.error('Error saving onboarding progress:', error);
      }
    }
  };

  const handleComplete = async () => {
    const allCompleted = checklistItems.every(item => item.completed);
    
    if (allCompleted) {
      // Set onboarding as completed
      if (user) {
        try {
          const { error } = await supabase
            .from('user_onboarding')
            .upsert({
              user_id: user.id,
              onboarding_data: checklistItems as unknown as Json,
              completed: true
            });
            
          if (error) throw error;
          
          // Update status in context and ensure it's fully processed
          await checkOnboardingStatus(user.id);
          
          // Add a small delay to ensure the state is updated before navigation
          setTimeout(() => {
            // Redirect directly to dashboard when all tasks are completed
            navigate("/dashboard");
            toast.success("Onboarding completed! Welcome to your dashboard.");
          }, 300); // Increased timeout to ensure state updates properly
        } catch (error) {
          console.error('Error completing onboarding:', error);
          toast.error("There was an error completing onboarding. Please try again.");
        }
      }
    } else {
      // Show warning that not all tasks are completed
      toast.warning("Please complete all onboarding tasks before proceeding.");
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="min-h-screen bg-zue-dark text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <OnboardingHeader 
          completedCount={completedCount} 
          totalCount={checklistItems.length} 
        />

        <ChecklistContainer 
          items={checklistItems} 
          onToggleItem={toggleItem} 
        />

        <OnboardingActions 
          progress={progress} 
          onComplete={handleComplete} 
          onBack={() => window.history.back()} 
        />
      </div>
    </div>
  );
};

export default Onboarding;
