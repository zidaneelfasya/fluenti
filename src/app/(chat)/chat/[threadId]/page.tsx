"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThoughtMessage } from "@/components/ThoughtMessage";
// import { db } from "~/lib/dexie";
// import {  useParams } from "react-router";
import { useParams } from "next/navigation";
// import { useLiveQuery } from "dexie-react-hooks";
import HELPER from "@/helper/helper";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";
import NoChatpage from "@/components/NoChatPage";

export default function Chatpage() {
  const [messageInput, setMessageInput] = useState("");
  const [stramedMessage, setStreamedMessage] = useState("");
  const [streamedThought, setStreamedThought] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [threadSelected, setThreadSelected] = useState(false);
  // const navigate = useNavigate();
  const params = useParams<{ threadId: string }>();
  
  

  useEffect(() => {
    const fetchMessages = async () => {
      if (!params) return;

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
    };

    fetchMessages();
  }, [params?.threadId]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedThought, stramedMessage]);

  const handleSubmit = async () => {
    try {
      const response = await HELPER.Axios("POST", "/api/chat/index", {
        thread_id: params?.threadId,
        message: messageInput,
      });
      if (response.success) {
        // Handle streaming data dari backend
        const eventSource = new EventSource(`localhost:3000/api/chat/`);
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.done) {
            eventSource.close();
            setStreamedMessage("");
            setStreamedThought("");
          } else {
            if (
              data.content.includes("<think>") ||
              data.content.includes("</think>")
            ) {
              setStreamedThought((prev) => prev + data.content);
            } else {
              setStreamedMessage((prev) => prev + data.content);
            }
          }
        };

        eventSource.onerror = (error) => {
          console.error("EventSource failed:", error);
          eventSource.close();
        };
      } else {
        console.error("Failed to send message:", response.message);
      }
    } catch (error) {
      console.error("error: ", error);
    }

    setStreamedMessage("");
    setStreamedThought("");
  };

  
  return (

        <div className="flex flex-col flex-1">
          <header className="flex items-center px-4 h-16 border-b">
            <h1 className="text-xl font-bold ml-4">Chat</h1>
          </header>

          <main className="flex-1 overflow-auto p-4 w-full">
            <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
              {messages?.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  thought={message.thought}
                />
              ))}

              {!!streamedThought && (
                <ThoughtMessage thought={streamedThought} />
              )}
              {!!stramedMessage && (
                <ChatMessage role="assistant" content={stramedMessage} />
              )}
              {/* Elemen ref untuk menggulir ke bawah */}
              <div ref={messagesEndRef} />
            </div>
          </main>
          <footer className="border-t p-4">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                className="flex-1"
                placeholder="Type your message here..."
                rows={5}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <Button onClick={handleSubmit} type="button">
                Send
              </Button>
            </div>
          </footer>
        </div>
      
  );
};


