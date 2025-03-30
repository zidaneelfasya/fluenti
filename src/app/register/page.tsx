"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, Lock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import HELPER from "@/helper/helper";

export default function Register() {
  const { setTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    HELPER.form("POST", "/api/auth/register", { username, password }).then((res) => {
      if (res.success) router.push("/login");
    });
  };

  return (
    
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div id="loading" style={{ display: "none" }}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4">
        
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
          {/* Card Header with gradient background */}
          <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white">Register</h1>
          </div>

          <div className="p-8">
            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-all"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              

              {/* Animated Login Button */}
              <div className="mb-6">
                <Button
                  type="submit"
                  className={`w-full bg-gradient-to-r mt-3 from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md ${
                    isLoading ? "animate-pulse opacity-80" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                
              </div>
            </div>

            {/* Social Login Buttons */}
           
            

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                have an account?{" "}
                <a href="login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}