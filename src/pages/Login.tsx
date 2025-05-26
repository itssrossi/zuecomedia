
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";

const Login = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const { signIn, signUp, isLoading } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setSignupLoading(true);
    await signUp(signupEmail, signupPassword, fullName);
    setSignupLoading(false);
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
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Login to Your Analytics Dashboard
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-white text-sm">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-zue-dark border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-white text-sm">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-zue-dark border-gray-700 text-white"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-zue-blue hover:bg-zue-blue-dark text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Create an Account
              </h2>
              
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-white text-sm">
                    Full Name
                  </label>
                  <Input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-zue-dark border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-white text-sm">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-zue-dark border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-white text-sm">
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
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
                  disabled={signupLoading || isLoading}
                >
                  {signupLoading || isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
