import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import ollama from "ollama";
import { IncomingForm } from "formidable";
import fs from "fs";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function transcribeWithWhisper(audioBuffer: Buffer): Promise<string> {
  const formData = new FormData();
  const uint8Array = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8Array], { type: "audio/webm" });
  formData.append("audio", blob, "recording.webm");

  const WHISPER_API_URL =
    process.env.WHISPER_API_URL || "http://localhost:8000/transcribe";

  const response = await fetch(WHISPER_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.text;
}

async function textToSpeechWithElevenLabs(text: string): Promise<string | null> {
  try {
    const ELEVENLABS_API_KEY = "sk_c89e8f6793a9721293f9a4371091536770bfbe02df336d93";
    const ELEVENLABS_VOICE_ID = "29vD33N1CtxCmqQRPOHJ";

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "accept": "audio/mpeg"
        },
        responseType: "arraybuffer"
      }
    );

    const audioBuffer = Buffer.from(response.data);
    return `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error with ElevenLabs TTS:",  error);
    return null;
  }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();

    // Parse form data
    const form = new IncomingForm();
    const { fields, files } = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      }
    );

    const thread_id = fields.thread_id?.[0];
    const audioFile = files.audio?.[0];

    if (!audioFile || !thread_id) {
      return res.status(400).json({
        success: false,
        message: "Missing audio file or thread ID",
      });
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: "Audio file too large (max 10MB)",
      });
    }

    const audioBuffer = fs.readFileSync(audioFile.filepath);
    const transcription = await transcribeWithWhisper(audioBuffer);

    // Save user message
    const userMessage = new Message({
      role: "user",
      content: transcription,
      thread_id: thread_id,
    });
    await userMessage.save();

    // Grammar correction
    // const prompt = `
    // I want you to act as a grammar corrector and a conversation responder.
    // Please follow these strict rules:
    
    // 1. If there is any grammar mistake in my sentence, correct it. If there is no correction needed, generate this text "No Need Correction".
    // 2. Only give the correction, just the correction, and nothing else.
  
    // Here is my sentence: """${transcription}"""
    // `;
    
    // const correctionResponse = await ollama.chat({
    //   model: "AfinAtsal/Grammar-Chechker",
    //   messages: [{ role: "user", content: prompt }],
    //   stream: false,
    // });

    const correctionResponse = await axios.post('http://172.16.15.187:8000/correct', {
      text: transcription
    })
    const normalizeText = (text: string) => {
      return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
    };
    
    let correction = "No Need Correction";
    if (normalizeText(correctionResponse.data.corrected) !== normalizeText(transcription)) {
      correction = correctionResponse.data.corrected;
    }

    let mode: true | false = true;

    let messages = correction;
    console.log("correction : ", correction);
    if (correction == "No Need Correction") {
      mode = false
      messages = transcription 
    }
    console.log("messages: ",messages)

    // Generate conversation
    const promptConversation = `
    Respond in a casual, friendly tone. Keep it short and conversational, like you're chatting with a friend. Avoid long explanations or formal language and make it 15-25 words long, also keep the conversation going by give feedback question.

    Here is my sentence: """${messages}"""
    `;

    const conversationResponse = await ollama.chat({
      model: "gemma3:4b",
      messages: [{ role: "user", content: promptConversation }],
      stream: false,
    });

    const conversation = conversationResponse.message.content;
    
    let audioUrl = null;
    // Generate audio from the conversation
    if (mode == true) {
      audioUrl = await textToSpeechWithElevenLabs("here's your corected answer "+ correction+"." + conversation);
    } else if (mode == false){
      audioUrl = await textToSpeechWithElevenLabs(conversation);

    }

    // Save AI message
    const newMessage = new Message({
      role: "assistant",
      content: conversation,
      correction: correction,
      thread_id: thread_id,
    });
    await newMessage.save();

    // Send complete response
    res.status(200).json({
      success: true,
      conversation,
      correction,
      transcription,
      audioUrl,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
}