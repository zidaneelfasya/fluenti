import mongoose, { Schema, Document } from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    thought: { type: String },
    correction: { type: String },
    thread_id: { type: String, ref: "Thread", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);

