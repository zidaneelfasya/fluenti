import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import ollama from "ollama";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set header SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Encoding", "none");

  try {
    await connectToDatabase();
    const { messages, thread_id } = req.body;

    // Simpan pesan user
    const userMessage = new Message({
      role: "user",
      content: messages,
      thought: "",
      thread_id: thread_id,
    });
    await userMessage.save();
    const prompt = `
    Saya ingin kamu bertindak sebagai grammar corrector dan pemberi respons percakapan.
    Berikut adalah aturannya:
    
    1. Koreksi kalimat saya jika ada kesalahan grammar.
    2. Masukkan kalimat yang sudah dikoreksi ke dalam tag <correction>...</correction>.
    3. Buatlah respons percakapan (berdasarkan kalimat yang dikoreksi) dan masukkan ke dalam tag <conversation>...</conversation>.
    4. Jangan menjelaskan apapun, hanya tampilkan dua tag tersebut.
    
    Kalimat saya: """${messages}"""
    `;
    const stream = await ollama.chat({
      // model: "deepseek-r1:8b",
      // model: "mistral",
      model: "AfinAtsal/Grammar-Chechker",


      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    let fullContent = "";
    let fullThought = "";
    let outputMode: "think" | "response" = "think";

    for await (const part of stream) {
      const messageContent = part.message.content;
      let eventData = {};
      fullContent += messageContent;
      eventData = { type: "message", content: fullContent };

      if (outputMode === "think") {
        if (!messageContent.includes("</think>")) {
          fullThought += messageContent;
          eventData = { type: "thought", content: fullThought };
        } else {
          outputMode = "response";
          eventData = { type: "thought_end" };
        }
      } else {
        fullContent += messageContent;
        eventData = { type: "message", content: fullContent };
      }

      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }

    // Simpan pesan AI
    const newMessage = new Message({
      role: "assistant",
      content: fullContent,
      thought: "",
      thread_id: thread_id,
    });
    await newMessage.save();

    // Akhiri stream
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  } catch (error) {
    console.error("Error:", error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
  } finally {
    res.end();
  }
}
