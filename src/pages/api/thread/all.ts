import { connectToDatabase } from "@/lib/mongodb";
import Thread from "@/models/Thread";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getAllThreads(req: NextApiRequest, res:NextApiResponse) {
  try {
      await connectToDatabase();
      const threads = await Thread.find({ });
      return res
        .status(200)
        .json({ message: "data retrieved successfully", data: threads });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong", error: error });
    }
}