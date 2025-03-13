import mongoose, { Schema, Document } from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    thought: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
