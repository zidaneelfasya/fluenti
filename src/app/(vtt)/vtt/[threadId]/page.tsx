"use client";

import AudioVisualizer from "@/components/AudioVisualizer";
import { ChatMessage } from "@/components/ChatMessage";
import { ThoughtMessage } from "@/components/ThoughtMessage";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import API from "@/helper/apiHelper";
import HELPER from "@/helper/helper";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const vtv = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchMessages = async () => {
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
  };

  useEffect(() => {
    fetchMessages();
  }, [params?.threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("thread_id", params?.threadId || "");

      const response = await API.postWithAudio("/api/chat/audio", formData);

      if (response.success) {
        // Update messages with the new response
        setMessages(prev => [
          ...prev,
          { 
            role: "user", 
            content: response.transcription,
          }
        ]);
        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: response.conversation,
            correction: response.correction
          }
        ]);
        
        
        // Set the audio URL to be played
        if (response.audioUrl) {
          setAudioUrl(response.audioUrl);
        }
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      HELPER.showAlert("error", {
        text: "Terjadi kesalahan saat memproses audio",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleModeChange = (value: string) => {
    if (!params?.threadId) return;
    
    switch (value) {
      case "gcheck":
        router.push(`/gcheck/${params.threadId}`);
        break;
      case "vtt":
        router.push(`/vtt/${params.threadId}`);
        break;
      case "fluenti":
        // Add fluency route here if needed
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-4 h-16 border-b justify-between">
        <h1 className="text-xl font-bold ml-4">Chat</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Voice-to-Voice</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleModeChange("gcheck")}>
              Grammar Check
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("vtt")}>
              Voice-to-Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeChange("fluenti")}>
              Fluenti
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-row h-[calc(100vh-4rem)]">
        {/* Audio Visualizer */}
        <div className="w-full flex flex-1 flex-col items-center justify-center p-16 sticky top-16">
          <AudioVisualizer 
            onRecordingComplete={handleRecordingComplete} 
            isLoading={isLoading}
          />
          {/* Hidden audio element for playing responses */}
          <audio ref={audioRef} hidden />
        </div>

        {/* Messages Area */}
        <div className="flex shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1),2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3),2px_0_4px_-2px_rgba(0,0,0,0.2)]">
          <div className="bg-sidebarcolor w-[30vw] flex flex-col h-full px-4">
            <div className="flex-1 overflow-y-auto space-y-4 pb-20">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default vtv;