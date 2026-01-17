import connectDB from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
    });

    console.log("✅ User Inserted:", newUser);

    if (!newUser.insertedId) {
      throw new Error("❌ Failed to insert user in database!");
    }

    const token = jwt.sign(
      { userId: newUser.insertedId, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
