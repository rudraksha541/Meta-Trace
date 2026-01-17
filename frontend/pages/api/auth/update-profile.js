import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    const { name, email, currentPassword, newPassword } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    // Fetch the user to verify the current password
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password if a new password is provided
    if (newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.collection("users").updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { name, email, password: hashedPassword } }
      );
    } else {
      // Update only name and email if no new password is provided
      await db.collection("users").updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { name, email } }
      );
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}