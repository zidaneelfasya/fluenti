import type { NextApiRequest, NextApiResponse } from "next";
import { hashSync } from "bcrypt-ts";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  await connectToDatabase();

  try {
    // Cek apakah user sudah terdaftar
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = hashSync(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
}
