import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { fileIds } = req.body; // Get file IDs from the request body
    if (!fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({ message: "Invalid file IDs" });
    }

    const client = await clientPromise;
    const db = client.db("testdb");
    const objectIds = fileIds.map((id) => new ObjectId(id));
    const result = await db.collection("uploads").deleteMany({
      _id: { $in: objectIds }, // Use the converted ObjectIds
    });

    if (result.deletedCount > 0) {
      return res.status(200).json({ message: "All files deleted successfully" });
    } else {
      return res.status(404).json({ message: "No files found to delete" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete files", error: error.message });
  }
}