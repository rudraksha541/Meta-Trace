import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI || "❌ Not Found!");

const uri = process.env.MONGO_URI; // 🔄 Changed from MONGODB_URI to MONGO_URI
if (!uri) {
  throw new Error("❌ MONGO_URI is missing! Ensure it is set in `.env`.");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default clientPromise;
