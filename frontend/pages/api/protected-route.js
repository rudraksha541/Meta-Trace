import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise;
    const db = client.db("testdb");
    const users = db.collection("users");

    const user = await users.findOne({ email: decoded.email }, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
}
