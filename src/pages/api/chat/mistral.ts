import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import ollama from "ollama";

export default async function chatMistral(req: any, res: any) {
  try {
    // await verifyAPI(req, res);
    await connectToDatabase();
    const { messages, thread_id } = req.body;

    const stream = await ollama.chat({
      // model: "deepseek-r1:8b",
      model: "mistral",

      messages: [
        {
          role: "user",
          content: messages,
        },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    let fullContent = "";
    let fullThought = "";
    
    for await (const part of stream) {
      const messageContent = part.message.content;
      fullContent += messageContent;
      const chunk = JSON.stringify({
        content: part.message.content,
        done: false,
      });
      res.write(`data: ${chunk}\n\n`);
    }

    const newMessage = new Message({
      role: "assistant",
      content: fullContent,
      thought: fullThought,
      thread_id: thread_id,
    });
    await newMessage.save();
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    // return res.status(201).json({
    //   message: "Message sent successfully",
    //   data: newMessage,
    // });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
