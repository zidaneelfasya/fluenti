import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";
import User from "../../models/User";

export default async function handler(req: any, res: NextApiResponse) {
  // await verifyAPI(req, res);

  await connectToDatabase();

  switch (req.method) {
    case "GET":
      get(req, res);
      break;
    // case "POST":
    //   post(req, res);
    //   break;
    // case "PUT":
    //   post(req, res);
    //   break;
    default:
      return res.status(405).json({ message: "Method not allowed" });
      break;
  }
}
const get = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectToDatabase();

  try {
    // Mengambil semua data user dari database
    const users = await User.find({});

    // Mengembalikan data user sebagai response
    return res.status(200).json({ users });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error });
  }
}