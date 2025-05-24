"use client"; // Tambahkan ini di paling atas

import { ChatSidebar } from "@/components/ChatSidebar";
import HistoryChat from "@/components/HistoryChat";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import {VtvSidebar} from "@/components/VtvSidebar";
import { GcheckSidebar } from "@/components/GcheckSidebar";
import { TttGcheckSidebar } from "@/components/TttGcheckSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (

      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="flex h-screen bg-background justify-between w-full">
          
          <div className="hidden lg:block"></div>
          {/* <ChatSidebar /> */}
            <TttGcheckSidebar />
          {children} {/* Gunakan children bukan impor langsung */}
        </div>
      </SidebarProvider>
    
  );
}
