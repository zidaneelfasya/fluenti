import { parse } from "cookie";
import { jwtVerify } from "jose";
import { NextApiRequest, NextApiResponse } from "next";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "!@#$%^&*()");

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    console.error("Invalid token:", error);
    throw new Error("Invalid or expired token")
  }
}
export async function verifyAPI(req: any, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decode = await jwtVerify(token, secretKey); 
    req.user = decode 
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error });
  }
}
