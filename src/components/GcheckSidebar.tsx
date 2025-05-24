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

export const GcheckSidebar = () => {
  const [activeThread, setActiveThread] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(false); // Tambahkan state untuk trigger refresh
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchThreads();
  }, [refreshFlag]); // Tambahkan refreshFlag sebagai dependency

  const fetchThreads = async () => {
    try {
      const res = await HELPER.Axios("GET", "/api/thread/gcheck/get");
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
    const threadId = pathname ? pathname.split("/")[2] : "";
    setActiveThread(threadId || "");
  }, [pathname]);

  const handleCreateThread = async () => {
    try {
      const response = await HELPER.form("POST", "/api/thread/create", {
        title: textInput,
        feature: "grammar-check",
      });

      if (response.success) {
        // Trigger refresh dengan mengubah state refreshFlag
        setRefreshFlag((prev) => !prev);
        // Redirect ke thread yang baru dibuat
        router.push(`/gcheck/${response.data.thread._id}`);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsDialogOpen(false);
      setTextInput("");
    }
  };

  return (
    <div className="bg-sidebarcolor border-hidden  shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1),2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3),2px_0_4px_-2px_rgba(0,0,0,0.2)]">
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
            className="flex items-center justify-center py-3 mb-4 text-xl font-bold"
          >
            <div className="flex items-center gap-2">
              <img className="h-10 w-full" src="/logo.png" alt="Fluenti Logo" />
              {/* <span>Fluenti</span> */}
            </div>
          </Link>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className=" w-full py-5 justify-center bg-primary text-primary-foreground text-md rounded-[8px] "
          >
            {/* <Plus className="mr-2 h-4 w-4" /> */}
            <img className="h-4 w-4" src="chat-plus.png" alt="Fluenti Logo" />
            make a conversation ...
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
              <SidebarMenu>
                {threads?.map((thread) => (
                  <SidebarMenuItem key={thread._id}>
                    <Link href={`/gcheck/${thread._id}`} passHref legacyBehavior>
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
          {/* <Button
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
          </Button> */}

          <Button
            onClick={handleToggleTheme}
            variant="ghost"
            className="w-full justify-start mb-14"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all" />
              </>
            ) : (
              <>
                <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all" />
                <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              </>
            )}
            <span className="ml-2">Toggle Theme</span>
          </Button>
        </SidebarFooter>
      </SidebarPrimitive>
    </div>
  );
};
