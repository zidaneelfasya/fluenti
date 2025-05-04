"use client";

import AudioVisualizer from "@/components/AudioVisualizer";
import { ChatMessage } from "@/components/ChatMessage";
import { ThoughtMessage } from "@/components/ThoughtMessage";
import HELPER from "@/helper/helper";
import { BotMessageSquare, Download, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const vtv = () => {
  const [messageInput, setMessageInput] = useState("");
  const [streamedMessage, setStreamedMessage] = useState("");
  const [streamedThought, setStreamedThought] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const params = useParams<{ threadId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!params?.threadId) return;

      // console.log(params?.threadId); 
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
      const response = await fetch("/api/chat/mistral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        const lines = chunk.split("\n\n").filter((line) => line.trim());

        for (const line of lines) {
          const eventData = JSON.parse(line.replace("data: ", ""));

          switch (eventData.type) {
            case "thought":
              setStreamedThought(eventData.content);
              break;
            case "thought_end":
              setStreamedThought((prev) => prev + "</think>");
              break;
            case "message":
              setStreamedMessage(eventData.content);
              break;
            case "done":
              if (params?.threadId) {
                const response = await HELPER.Axios("GET", "/api/message/get", {
                  thread_id: params.threadId,
                });
                if (response.success) setMessages(response.data.messages);
              }
              setStreamedMessage("");
              setStreamedThought("");
              break;
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      HELPER.showAlert("error", {
        text: "Terjadi kesalahan saat mengirim pesan",
      });
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      // 1. Buat URL dari Blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // 2. Buat elemen audio untuk diputar
      const audio = new Audio(audioUrl);
      
      // 3. Inisialisasi SpeechRecognition dengan type checking
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech Recognition API tidak didukung di browser ini');
      }
  
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      // 4. Promise wrapper untuk menunggu hasil
      const transcript = await new Promise<string>((resolve, reject) => {
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };
        
        recognition.onerror = (event: any) => {
          reject(new Error(`Error recognition: ${event.error}`));
        };
        
        // Mulai pemrosesan
        audio.play();
        recognition.start();
      });
  
      console.log('Hasil transkripsi suara:', transcript);
      setMessageInput(transcript);
  
    } catch (error) {
      console.error('Error dalam handleRecordingComplete:', error);
      HELPER.showAlert("error", {
        text: error instanceof Error ? error.message : "Gagal memproses rekaman suara",
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-4 h-16 border-b">
        <h1 className="text-xl font-bold ml-4">Chat</h1>
      </header>
      <div className="flex flex-row h-[calc(100vh-4rem)]">
        {/* Audio Visualizer - Fixed Position */}
        <div className="w-full flex flex-1 flex-col items-center justify-center p-16 sticky top-16">
          <AudioVisualizer onRecordingComplete={handleRecordingComplete} />
          
{/*           
          {audioUrl && (
            <button
              onClick={handleDownloadAudio}
              className="mt-4 flex items-center justify-center gap-2 bg-[#5A00FF] hover:bg-[#4a00e0] text-white px-4 py-2 rounded-full transition-colors"
            >
              <Download size={18} />
              <span>Download Recording</span>
            </button>
          )} */}
        </div>

        {/* Messages - Scrollable Area */}
        <div className=" flex shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1),2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3),2px_0_4px_-2px_rgba(0,0,0,0.2)]">
          <div className="bg-sidebarcolor w-[30vw] flex flex-col h-full px-4" >
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-4 pb-20 "
            >
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
              {!!streamedMessage && (
                <ChatMessage role="assistant" content={streamedMessage} />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default vtv;