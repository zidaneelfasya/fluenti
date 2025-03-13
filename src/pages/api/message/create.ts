import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import { NextApiRequest, NextApiResponse } from "next";

export default async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    // await verifyAPI(req, res);
    await connectToDatabase();
    const { content, thread_id } = req.body;
    if (!thread_id) {
      return res.status(400).json({ message: "Thread ID is required" });
    }
    // const thread = await Thread.findOne({
    //   $and: [{ _id: thread_id }, { user_id: req.user.id }],
    // })
    //   .populate("user_id", "username _id")
    //   .lean();
    const newMessage = new Message({
      role: "user",
      content: content,
      thought: "",
      thread_id: thread_id,
    });
    await newMessage.save();
    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}