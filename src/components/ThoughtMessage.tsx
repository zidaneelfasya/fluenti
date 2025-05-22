import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Separator } from "./ui/separator";


type ThoughtMessageProps = {
  thought: any;
};

export const ThoughtMessage = (props: ThoughtMessageProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem  value="thought">
        <AccordionTrigger className="text-sm italic px-2 py-1 bg-secondary rounded-lg">
          Correction
        </AccordionTrigger>
        <AccordionContent className="p-4 relative rounded text-muted-foreground text-sm flex">
          <Separator
            orientation="vertical"
            className="absolute left-0 top-4 h-[calc(100%-2rem)] w-[3px]"
          />
          <p className="flex-1 whitespace-pre-line">{props.thought.trim()}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
