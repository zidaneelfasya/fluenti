import { verifyAPI } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Thread from "@/models/Thread";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifyAPI(req, res);
    await connectToDatabase();
    const me = req.cookies.idUser;
    const { title, feature } = req.body;
    const newId = crypto.randomUUID();
    
    const newThread = new Thread({ _id: newId, title, feature: feature, user_id: me });
    console.log(newId);
    console.log(me)
    const savedThread = await newThread.save();

    return res
      .status(201)
      .json({
        message: "Thread created successfully",
        thread: savedThread,
        user: me,
      });  
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

