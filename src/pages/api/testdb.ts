import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

export default async function connectToDatabase(req: any, res: any) {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return res.status(200).json({ 
        message: "Already connected to MongoDB",
        host: mongoose.connection.host
      });
    }

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    return res.status(200).json({ 
      message: "MongoDB connected", 
      host: conn.connection.host 
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return res.status(500).json({ 
      error: "Database connection failed",
      details: error
    });
  }
}