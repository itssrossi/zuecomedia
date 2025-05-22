
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, isLoading, isOnboardingCompleted, checkOnboardingStatus } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyOnboardingStatus = async () => {
      if (user) {
        // Re-check onboarding status when the component mounts to ensure it's fresh
        await checkOnboardingStatus(user.id);
      }
      setIsChecking(false);
    };

    verifyOnboardingStatus();
  }, [user, checkOnboardingStatus]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zue-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Redirect logic based on onboarding completion
  if (location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/")) {
    // If trying to access dashboard but onboarding not completed
    if (!isOnboardingCompleted && requireOnboarding) {
      console.log("Redirecting to onboarding from dashboard");
      return <Navigate to="/onboarding" replace />;
    }
  } else if (location.pathname === "/onboarding") {
    // If trying to access onboarding but already completed
    if (isOnboardingCompleted && requireOnboarding) {
      console.log("Redirecting to dashboard from onboarding");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
