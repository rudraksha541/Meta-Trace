import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email } = req.query; // Get email from query parameters
    if (!email) {
      return res.status(400).json({ message: "User email is required" });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    // Fetch files for the specific user, sorted by uploadDate in descending order
    const files = await db
      .collection("uploads")
      .find({ email }) // Filter by user email
      .sort({ uploadDate: -1 })
      .toArray();

    res.status(200).json({ files });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to retrieve files", error: error.message });
  }
}