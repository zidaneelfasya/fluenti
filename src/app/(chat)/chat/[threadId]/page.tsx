"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThoughtMessage } from "@/components/ThoughtMessage";
import { useParams } from "next/navigation";
import HELPER from "@/helper/helper";

export default function Chatpage() {
  const [messageInput, setMessageInput] = useState("");
  const [streamedMessage, setStreamedMessage] = useState("");
  const [streamedThought, setStreamedThought] = useState("");
  const [messages, setMessages] = useState<{
    role: string;
    content: string;
    thought?: string;
    thread_id?: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams<{ threadId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!params?.threadId) return;

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedThought, streamedMessage]);

  const handleSubmit = async () => {
    
    try {
      const userMessage = {
        role: "user",
        content: messageInput,
        thought: "",
        thread_id: params?.threadId,
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessageInput("");
      // Kirim pesan ke API
      const response = await fetch('/api/chat/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageInput,
          thread_id: params?.threadId,
        }),
      });

      // Handle stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(line => line.trim());

        for (const line of lines) {
          const eventData = JSON.parse(line.replace('data: ', ''));
          
          switch (eventData.type) {
            case 'thought':
              setStreamedThought(eventData.content);
              break;
            case 'thought_end':
              setStreamedThought(prev => prev + '</think>');
              break;
            case 'message':
              setStreamedMessage(eventData.content);
              break;
            case 'done':
              
              if (params?.threadId) {
                const response = await HELPER.Axios("GET", "/api/message/get", {
                  thread_id: params.threadId,
                });
                if (response.success) setMessages(response.data.messages);
              }
              setStreamedMessage('');
              setStreamedThought('');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      HELPER.showAlert('error', { text: 'Terjadi kesalahan saat mengirim pesan' });
    }
    
    // setMessageInput('');
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-4 h-16">
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

          {!!streamedThought && <ThoughtMessage thought={streamedThought} />}
          {!!streamedMessage && (
            <ChatMessage role="assistant" content={streamedMessage} />
          )}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSubmit} 
            type="button"
            
          >
            send
          </Button>
        </div>
        
      </footer>
    </div>
  );
}