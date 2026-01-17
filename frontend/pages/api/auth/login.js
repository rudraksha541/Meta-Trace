import connectDB from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // ✅ Connect to MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // ✅ Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ✅ Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ✅ Ensure JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing!");
      return res.status(500).json({ message: "Server error: JWT_SECRET missing" });
    }

    // ✅ Generate Token (7-day expiry)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 🔥 Expiry fixed to 7 days
    );

    // ✅ Debugging token expiry
    const decodedToken = jwt.decode(token);
    console.log("✅ Token Expiry:", new Date(decodedToken.exp * 1000).toLocaleString());

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      token,
      expiry: decodedToken.exp * 1000, // Send expiry timestamp to frontend
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
