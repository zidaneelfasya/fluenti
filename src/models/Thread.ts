import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    feature: { 
      type: String, 
      required: true,
      enum: ["grammar-check", "voice-to-voice", "voice-to-text", "vtv-gcheck", "text-to-text", ],
    },
    user_id: { type: String, ref: "User", required: true }, 
  },
  { timestamps: true }
);

export default mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);