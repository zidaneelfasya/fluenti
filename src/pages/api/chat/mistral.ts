import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import ollama from "ollama";

export default async function chatMistral(req: any, res: any) {
  try {
    await connectToDatabase();
    const { messages, thread_id } = req.body;
    
    // Save user message
    const userMessage = new Message({
      role: "user",
      content: messages,
      thought: "",
      thread_id: thread_id,
    });
    await userMessage.save();

    // Start Ollama chat stream
    const stream = await ollama.chat({
      model: "mistral",
      messages: [{ role: "user", content: messages }],
      stream: true,
    });

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    let fullContent = "";
    
    // Stream responses
    for await (const part of stream) {
      const messageContent = part.message.content;
      fullContent += messageContent;
      
      // Send each chunk as SSE event
      res.write(`data: ${JSON.stringify({
        content: messageContent,
        done: false
      })}\n\n`);
    }

    // Save assistant message
    const newMessage = new Message({
      role: "assistant",
      content: fullContent,
      thought: "", // Isi ini jika ada thought yang ingin disimpan
      thread_id: thread_id,
    });
    await newMessage.save();

    // Send final done event
    res.write(`data: ${JSON.stringify({
      content: fullContent,
      done: true
    })}\n\n`);
    
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}