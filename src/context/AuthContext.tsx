
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isOnboardingCompleted: boolean;
  checkOnboardingStatus: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const navigate = useNavigate();

  const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data: onboardingData, error } = await supabase
        .from('user_onboarding')
        .select('completed')
        .eq('user_id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking onboarding status:", error);
        return false;
      }
      
      const completed = onboardingData?.completed || false;
      setIsOnboardingCompleted(completed);
      return completed;
    } catch (error) {
      console.error("Error in checkOnboardingStatus:", error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check onboarding status whenever auth state changes
        if (currentSession?.user) {
          await checkOnboardingStatus(currentSession.user.id);
        } else {
          setIsOnboardingCompleted(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check onboarding status for existing session
      if (currentSession?.user) {
        await checkOnboardingStatus(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if this user has completed onboarding
      if (data.user) {
        const completed = await checkOnboardingStatus(data.user.id);
        
        toast.success("Signed in successfully");
        
        // If onboarding is not completed, redirect to onboarding
        if (!completed) {
          navigate("/onboarding");
        } else {
          // Otherwise go to dashboard
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      
      if (error) throw error;
      
      // Check if a new user was created
      if (data.user && data.session) {
        // User is automatically signed in after signing up
        setUser(data.user);
        setSession(data.session);
        
        // Create entry in profiles table
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
          });
        } catch (profileError) {
          console.error("Error creating profile:", profileError);
        }
        
        // Create entry in user_onboarding table
        try {
          const { error: onboardingError } = await supabase
            .from('user_onboarding')
            .insert({
              user_id: data.user.id,
              onboarding_data: [],
              completed: false
            });
            
          if (onboardingError) throw onboardingError;
        } catch (onboardingError) {
          console.error("Error creating onboarding record:", onboardingError);
        }
        
        setIsOnboardingCompleted(false);
        toast.success("Signed up successfully");
        // Always redirect to onboarding page for new users
        navigate("/onboarding");
      } else {
        toast.success("Signed up successfully. Please check your email for verification.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsOnboardingCompleted(false);
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      isOnboardingCompleted,
      checkOnboardingStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
