import mongoose from "mongoose";


const ThreadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    user_id: { type: String, ref: "User", required: true }, 
  },
  { timestamps: true }
);

// ThreadSchema.virtual("id_thread").get(function () {
//   return this._id;
// });
export default mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);
