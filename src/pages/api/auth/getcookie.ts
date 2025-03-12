import { verifyAPI } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: any,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Ambil cookie dari request
    await verifyAPI(req, res);

    const me = req.user.payload.id;
    const token = req.cookies.token; 
    const idUser = req.cookies.idUser; 

    if (!token || !idUser) {
      return res.status(404).json({ message: "Cookie not found" });
    }

    // Kirim cookie sebagai response
    return res.status(200).json({
      message: "Cookie retrieved successfully",
      data: {
        me,
        token,
        idUser,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
}