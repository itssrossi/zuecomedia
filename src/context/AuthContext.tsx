
import { createContext, useContext, useEffect, useState } from "react";
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
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  checkOnboardingStatus?: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simplified version - no longer checking onboarding status
  const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
    // Simply return true to indicate onboarding is "completed" for all users
    // This effectively bypasses onboarding checks while allowing the function to still exist
    return true;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast.success("Signed in successfully");
      
      // Always go to dashboard after login - simplified approach
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
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
        
        // For new users, create an onboarding entry but don't enforce completion
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
        
        toast.success("Signed up successfully");
        
        // New users are directed to onboarding but can skip to dashboard if needed
        window.location.href = "/onboarding";
      } else {
        toast.success("Signed up successfully. Please check your email for verification.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      window.location.href = "/login";
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      toast.success("If an account exists, a password reset email has been sent");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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
      resetPassword,
      updatePassword,
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
