import { verifyAPI } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Thread from "@/models/Thread";
import { NextApiRequest, NextApiResponse } from "next";


export default async function createThread(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifyAPI(req, res);
    await connectToDatabase();
    const me = req.cookies.idUser;
    const { title } = req.body;
    const newId = crypto.randomUUID();
    const newThread = new Thread({ _id: newId, title, user_id: me });
    console.log(newId);
    console.log(me)
    const savedThread = await newThread.save();

    return res
      .status(201)
      .json({
        message: "User registered successfully",
        thread: savedThread,
        user: me,
      });  
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

