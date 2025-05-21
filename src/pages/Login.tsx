
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // This is a simple authentication without actual backend
    // In a real app, you'd want to validate with a proper backend
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("isAuthenticated", "true");
      toast.success("Login successful");
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zue-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <a href="/" className="flex items-center">
            <img
              src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
              alt="Zue Co Media Logo"
              className="h-12 mr-2"
            />
            <span className="font-bold text-2xl text-white">
              Zue<span className="text-zue-blue">Co</span> Media
            </span>
          </a>
        </div>

        <div className="bg-zue-dark-light rounded-lg shadow-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Log In to Analytics Dashboard
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              For demo purposes, any email/password combination will work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
