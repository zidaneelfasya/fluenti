import mongoose from "mongoose";

const uri = process.env.MONGO_URI;


export async function connectToDatabase() {
  try {
    const conn = await mongoose.connect(`${uri}`);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
  console.log('MongoDB connection failed: ', error);
    throw error;
  }
}
