"use client";

import AudioVisualizer from "@/components/AudioVisualizer";
import { ChatMessage } from "@/components/ChatMessage";
import { ThoughtMessage } from "@/components/ThoughtMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import API from "@/helper/apiHelper";
import HELPER from "@/helper/helper";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash/debounce";

export default function GCheck() {  // Changed from gcheck to GCheck
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [textareaValue, setTextareaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const params = useParams<{ threadId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  // Memisahkan logika handle input dengan debounce
  const handleInputChange = useCallback((value: string) => {
    const debouncedFn = debounce((val: string) => {
      setMessageInput(val);
    }, 100);
    debouncedFn(value);
  }, []);

  const fetchMessages = useCallback(async () => {  // Added useCallback to fix the dependency warning
    if (!params?.threadId) return;

    try {
      const response = await HELPER.Axios("GET", "/api/message/get", {
        thread_id: params.threadId,
      });

      if (response.success) {
        setMessages(response.data.messages);
      } else {
        HELPER.showAlert("error", {
          text: response.message || "Gagal memuat percakapan",
        });
      }
    } catch (error) {
      HELPER.showAlert("error", {
        text: "Terjadi kesalahan saat memuat pesan",
      });
    }
  }, [params?.threadId]);

  useEffect(() => {
    fetchMessages();
  }, [params?.threadId, fetchMessages]);  // Added fetchMessages to dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const userMessage = {
        role: "user",
        content: textareaValue,
        thought: "",
        thread_id: params?.threadId,
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentMessage = textareaValue.trim();
      setTextareaValue(""); // Clear textarea immediately

      const response = await axios.post("/api/chat/grammar-check/ttt", {
        messages: currentMessage,
        thread_id: params?.threadId,
      });

      if (response.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.conversation,
            correction: response.data.correction,
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (value: string) => {
    if (!params?.threadId) return;

    switch (value) {
      case "vtv":
        router.push(`/voice-to-voice/`);
        break;
      case "vtt":
        router.push(`/vtt/`);
        break;
      case "vtv-gcheck":
        router.push(`/vtv-gcheck`);
        break;
      case "gcheck":
        router.push(`/gcheck`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-4 h-16 border-b justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Text-to-Text</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleModeChange("vtv")}>
              Voice-to-Voice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("vtt")}>
              Voice-to-Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("vtv-gcheck")}>
              vtv-gcheck
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("gcheck")}>
              Grammar check
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1 overflow-auto p-4 w-full">
        <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
          {messages?.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              thought={message.correction}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            className="flex-1"
            placeholder="Type your message here..."
            rows={5}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (textareaValue.trim()) {
                  handleSubmit();
                }
              }
            }}
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            type="button"
            disabled={isLoading || !textareaValue.trim()}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </footer>
    </div>
  );
}