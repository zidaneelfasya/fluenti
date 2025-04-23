import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User"; 
import { NextApiRequest, NextApiResponse } from "next";

export default async function getMessages(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    
    // This ensures both models are registered
    const messageModel = Message;
    const userModel = User;

    const { thread_id } = req.query;
    
    if (!thread_id) {
      return res.status(400).json({ message: "Thread ID is required" });
    }

    const messages = await Message.find({ thread_id: thread_id })
      .sort({ createdAt: 1 }) 
      .populate({
        path: "thread_id", 
        populate: {
          path: "user_id", 
          select: "username _id",
        },
      });

    return res.status(200).json({ messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}