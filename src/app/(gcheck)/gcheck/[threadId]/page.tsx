"use client";

import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HELPER from "@/helper/helper";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import { GrammarCorrectionMessage } from "@/components/GrammarCorrectionMessage";

export default function GCheck() {
  const [messages, setMessages] = useState<{
    role: "user" | "assistant";
    content: string;
    originalText?: string;
    correctedText?: string;
  }[]>([]);
  const [textareaValue, setTextareaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams<{ threadId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [messageInput, setMessageInput] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Memisahkan logika handle input dengan debounce
  const handleInputChange = useCallback((value: string) => {
    const debouncedFn = debounce((val: string) => {
      setMessageInput(val);
    }, 100);
    debouncedFn(value);
  }, []);

  const fetchMessages = useCallback(async () => {
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
  }, [fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const currentMessage = textareaValue.trim();
      setTextareaValue(""); // Clear textarea immediately
      const userMessage = {
        role: "user" as const,
        content: currentMessage,
        originalText: currentMessage,
        correctedText: undefined
      };

      setMessages((prev) => [...prev, userMessage]);

      const response = await axios.post("/api/chat/grammar-check/correct", {
        messages: currentMessage,
        thread_id: params?.threadId,
      });

      if (response.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.correction,
            originalText: currentMessage,
            correctedText: response.data.correction,
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
    switch (value) {
      case "vtv":
        router.push(`/voice-to-voice`);
        break;
      case "vtt":
        router.push(`/voice-to-text`);
        break;
      case "vtv-gcheck":
        router.push(`/vtv-gcheck`);
        break;
      case "ttt":
        router.push(`/text-to-text`);
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
            <Button variant="outline">Grammar check</Button>
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
            <DropdownMenuItem onClick={() => handleModeChange("ttt")}>
              Text-to-Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1 overflow-auto p-4 w-full">
        <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
          {messages?.map((message, index) => (
            message.originalText && message.correctedText ? (
              <GrammarCorrectionMessage
                key={index}
                role={message.role}
                originalText={message.originalText}
                correctedText={message.correctedText}
              />
            ) : (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            )
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
