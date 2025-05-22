import ReactMarkdown from "react-markdown";
import { ThoughtMessage } from "./ThoughtMessage";
import { useEffect, useRef } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  thought?: string;
  audioUrl?: string 
}

export const ChatMessage = (props: ChatMessageProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (props.audioUrl && audioRef.current) {
      audioRef.current.src = props.audioUrl;
      // Auto-play hanya untuk pesan asisten
      if (props.role === "assistant") {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      }
    }
  }, [props.audioUrl, props.role]);

  const isAssistant = props.role === "assistant";
  return (
    <>
  {!!props.thought && <ThoughtMessage thought={props.thought}/>}

    <div
      className={`flex items-start gap-4 ${
        isAssistant ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <div
        className={`rounded-lg p-4 max-w-[80%] ${
          isAssistant
            ? "bg-secondary"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <div className={isAssistant ? "prose dark:prose-invert": ""}>
        <ReactMarkdown>{typeof props.content === 'string' ? props.content.trim() : ''}</ReactMarkdown>
        </div>
      </div>
    </div>
    </>
  );
};
