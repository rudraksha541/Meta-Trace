import { MongoClient } from "mongodb";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined. Check your .env file.");
  }

  const client = new MongoClient(process.env.MONGO_URI, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  return client.db("testdb"); // Replace with your actual DB name
};

export default connectDB;