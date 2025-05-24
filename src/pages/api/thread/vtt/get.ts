import { verifyAPI } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Thread from "@/models/Thread";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getThreads(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();
    await verifyAPI(req, res);
    const me = req.cookies.idUser;
    console.log(me);
    const threads = await Thread.find({
      user_id: me,
      feature: "voice-to-text",
    });
    return res
      .status(200)
      .json({ message: "data retrieved successfully", data: threads });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
}
