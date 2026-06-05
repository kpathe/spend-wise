import mongoose from "mongoose";

export const connectDB = async (mongodbURI) => {
  try {
    const connectionInstance = await mongoose.connect(mongodbURI);
    console.log(`MongoDB Connected !`);
  } catch (error) {
    console.error("MongoDB connection failed: ", error);
    process.exit(1);
  }
};
