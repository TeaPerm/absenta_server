import mongoose from "mongoose";
import { envconfig } from "./env.config";

export async function connectToDatabase() {
  try {
    const uri = envconfig.database.uri;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB on: ",uri)
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}