import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import ollama from "ollama";
import { IncomingForm } from "formidable";
import fs from "fs";
import axios from "axios";
import { Content } from "@radix-ui/react-dialog";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();

    const { messages, thread_id } = req.body;

    // const thread_id = fields.thread_id?.[0];

    const userMessage = new Message({
      role: "user",
      content: messages,
      thread_id: thread_id,
    });
    await userMessage.save();

    // Grammar correction
    // const prompt = `
    // I want you to act as a grammar corrector and a conversation responder.
    // Please follow these strict rules:
    
    // 1. If there is any grammar mistake in my sentence, correct it. If there is no correction needed, generate this text "No Need Correction".
    // 2. exclude capital letters and punctuation
    // 3. Only give the correction, just the correction, and nothing else.
  
    // Here is my sentence: """${messages}"""
    // `;
    
    // const correctionResponse = await ollama.chat({
    //   model: "AfinAtsal/Grammar-Chechker",
    //   messages: [{ role: "user", content: prompt }],
    //   stream: false,
    // });

    const correctionResponse = await axios.post('http://localhost:5000/correct', {
      text: messages
    })
    
    // const real = correctionResponse.data.corrected
    
    let correction = "No Need Correction";
    if (!correctionResponse.data.corrected.toLowerCase().includes(messages.toLowerCase())) {
      correction = correctionResponse.data.corrected;
    }
    
    
    

    // Generate conversation
    
    const conversation = "";

    // Save AI message
    const newMessage = new Message({
      role: "assistant",
      content: correction,
      correction: "",
      thread_id: thread_id,
    });
    await newMessage.save();

    // Send complete response
    res.status(200).json({
      success: true,
      correction,
      messages,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
}