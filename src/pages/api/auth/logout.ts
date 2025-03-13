import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    
    const cookie = serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0), 
    });

    res.setHeader("Set-Cookie", cookie);
    
    res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}
