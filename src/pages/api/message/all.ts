import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getAllMessages(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();

    const messages = await Message.find({}).sort({ createdAt: 1 });

    return res
      .status(201)
      .json({ message: "data retrieved successfuly", data: messages });
  } catch (error) {}
}
