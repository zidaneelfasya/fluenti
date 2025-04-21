"use client"; // Tambahkan ini di paling atas

import { ChatSidebar } from "@/components/ChatSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen bg-background  w-full">
        <ChatSidebar />
        {children} {/* Gunakan children bukan impor langsung */}
      </div>
    </SidebarProvider>
  );
}