"use client"; // Mark as client component

import { Moon, Plus, Sun } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
} from "@/components/ui/sidebar";
import { useTheme } from "./ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { usePathname, useRouter } from "next/navigation";
import HELPER from "@/helper/helper";
import Link from "next/link";

// Thread type definition
interface Thread {
  _id: string;
  title: string;
}

export const ChatSidebar = () => {
  const [activeThread, setActiveThread] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await HELPER.Axios("GET", "/api/thread/get");
      // console.log(res.data.data);
      setThreads(res.data.data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  useEffect(() => {
    // Extract thread ID from path like /thread/[id]
    const threadId = pathname ? pathname.split("/")[2] : "";
    setActiveThread(threadId || "");
  }, [pathname]);

  const handleCreateThread = async () => {
    console.log("create thread");
    // Implement your thread creation logic here
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Threads</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="thread-title">Thread Title</Label>
            <Input
              id="thread-title"
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
              }}
              placeholder="Your thread title"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread}>Create Thread</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SidebarPrimitive>
        <SidebarHeader>
          <Link
            href="/"
            className="flex justify-center py-3 mb-4 text-xl font-bold hover:"
          >
            Chicken AI
          </Link>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-5 justify-start bg-primary text-primary-foreground text-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
              <SidebarMenu>
                {threads?.map((thread) => (
                  <SidebarMenuItem key={thread._id}>
                    <Link href={`/chat/${thread._id}`} passHref legacyBehavior>
                      <SidebarMenuButton isActive={thread._id === activeThread}>
                        {thread.title}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            className="flex items-center px-2 py-1 space-x-2"
            onClick={async () => {
              try {
                const res = await HELPER.Axios("POST", "api/auth/logout");
                if (res.success) {
                  localStorage.removeItem("token");
                  router.push("/login");
                }
              } catch (error) {
                console.error("Logout error:", error);
              }
            }}
          >
            Logout
          </Button>

          <Button
            onClick={handleToggleTheme}
            variant="ghost"
            className="w-full justify-start"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            Toggle Theme
          </Button>
        </SidebarFooter>
      </SidebarPrimitive>
    </>
  );
};