import ReactMarkdown from "react-markdown";
import { ThoughtMessage } from "./ThoughtMessage";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  thought?: string;
}

export const ChatMessage = (props: ChatMessageProps) => {
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
          <ReactMarkdown>{props.content.trim()}</ReactMarkdown>
        </div>
      </div>
    </div>
    </>
  );
};
