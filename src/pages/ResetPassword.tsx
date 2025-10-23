import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    await updatePassword(newPassword);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zue-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <a href="/" className="flex items-center">
            {theme === 'light' ? (
              <img
                src="/lovable-uploads/c5a928fa-35df-4bf0-b39d-7b83e2cbc714.png"
                alt="Zue Co Media Light Logo"
                className="h-12 mr-2"
              />
            ) : (
              <img
                src="/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png"
                alt="Zue Co Media Dark Logo"
                className="h-12 mr-2"
              />
            )}
            <span className="font-bold text-2xl text-white">
              Zue<span className="text-zue-blue">Co</span> Media
            </span>
          </a>
        </div>

        <div className="bg-zue-dark-light rounded-lg shadow-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            Reset Your Password
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-white text-sm">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zue-dark border-gray-700 text-white"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-white text-sm">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zue-dark border-gray-700 text-white"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-zue-blue hover:bg-zue-blue-dark text-white"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-gray-400 hover:text-zue-blue transition-colors text-center w-full"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
