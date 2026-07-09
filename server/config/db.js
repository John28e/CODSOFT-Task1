import mongoose from "mongoose";

// Cache the connection across serverless function invocations.
// In a warm Vercel function, the module is already loaded and
// mongoose.connection.readyState === 1, so we skip re-connecting.
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Recommended settings for serverless environments
      bufferCommands: false,
      maxPoolSize: 10,
    });
    isConnected = conn.connection.readyState === 1;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
