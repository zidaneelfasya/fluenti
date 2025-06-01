"use client";

import { Button } from "@/components/ui/button";
import HELPER from "@/helper/helper";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts
    HELPER.Axios('GET', 'api/auth/getcookie').then(res => {
      const data = res.data;
      if (data) {
        setIsLoggedIn(true);
      }
    });
  }, []);
  
  const handleLogout = async () => {
    HELPER.Axios('POST', 'api/logout').then(res => {
      if(res.success) {
        setIsLoggedIn(false);
        router.replace('/');
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-[#12141F] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between py-4 px-4 md:px-28">
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo-fluenti.png" 
              alt="Fluenti Logo" 
              width={32}
              height={32}
              className="w-8 md:w-auto"
            />
            <span className="text-lg md:text-xl font-bold">fluenti</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Product
            </Link>
            <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Services
            </Link>
            <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              API
            </Link>
            <Link href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Documentation
            </Link>
          </div>
        </div>
        <div className="flex space-x-2 md:space-x-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#12141F] border border-purple-500/20">
                <Link href="/voice-to-voice">
                  <DropdownMenuItem className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Voice to Voice
                  </DropdownMenuItem>
                </Link>
                <Link href="/grammar-check">
                  <DropdownMenuItem className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Grammar Check
                  </DropdownMenuItem>
                </Link>
                <Link href="/text-to-text">
                  <DropdownMenuItem className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Text to Text
                  </DropdownMenuItem>
                </Link>
                <Link href="/vtv-gcheck">
                  <DropdownMenuItem className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    VTV GCheck
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem 
                  className="text-purple-400 hover:text-purple-300 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <button className="px-3 md:px-6 py-2 text-sm md:text-base rounded-lg hover:bg-white/10 transition-all transform hover:scale-105">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-3 md:px-6 py-2 text-sm md:text-base bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 md:px-6 py-10 md:py-20 max-w-8xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="md:pl-24 text-center lg:text-left">
              <div className="">
                <p className="text-purple-400 text-base md:text-lg mb-2 md:mb-4">Fluenti</p>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight mb-4 md:mb-6">
                  Learning By Speech ayam goreng
                </h1>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8">
                  Speak English with Confidence. Powered by AI.
                  Practice real conversations anytime, anywhere.
                  Get instant feedback on pronunciation,
                  grammar, and fluency — just like talking to
                  a native speaker.
                </p>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <Link href="/vtv-gcheck">
                  <button className="px-6 md:px-8 py-3 md:py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                    Try On Fluenti
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-600 rounded-lg font-semibold hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                    Make an Account
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <Image 
            src="/hero.png" 
            alt="Hero Image" 
            width={800}
            height={600}
            className="w-full"
          />
        </div>
      </section>

      {/* Second Section */}
      <section className="min-h-screen px-4 md:px-6 pt-10 md:py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <Image 
            src="/about.png" 
            alt="About Image" 
            width={800}
            height={600}
            className="w-full"
          />
          {/* Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              The More You Speak,
              <br />
              Stronger You Are
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Our application is designed to help you speak English confidently
              through real-time, AI-powered conversations. You can practice
              naturally, as if you&apos;re talking to a native speaker. The
              intelligent system listens, understands, and gives instant
              feedback on your pronunciation, grammar, and fluency — so you
              learn and improve as you speak.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}