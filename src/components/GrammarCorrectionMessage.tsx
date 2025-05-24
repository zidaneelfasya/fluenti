import { cn } from "@/lib/utils";
import React from "react";
import { diffWords } from "diff";

interface GrammarCorrectionMessageProps {
  originalText: string;
  correctedText: string;
  role: "user" | "assistant";
}

export const GrammarCorrectionMessage: React.FC<GrammarCorrectionMessageProps> = ({
  originalText,
  correctedText,
  role,
}) => {
  const differences = diffWords(originalText, correctedText);

  return (
    <div
      className={cn(
        "flex w-full",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <div className="mb-2">
          <h4 className="font-semibold">Original Text:</h4>
          <p>
            {differences.map((part, index) => (
              <span
                key={index}
                className={cn(
                  part.removed && "line-through text-red-500",
                  !part.added && !part.removed && "text-current"
                )}
              >
                {part.value}
              </span>
            ))}
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Corrected Text:</h4>
          <p>
            {differences.map((part, index) => (
              <span
                key={index}
                className={cn(
                  part.added && "text-green-500 font-medium",
                  !part.added && !part.removed && "text-current"
                )}
              >
                {part.value}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}; 