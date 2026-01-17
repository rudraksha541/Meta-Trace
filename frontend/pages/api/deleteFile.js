import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'No ID provided' });
    }

    const client = await MongoClient.connect(
      "YOUR Database UR"
    );
    const db = client.db();
    const collection = db.collection('uploads');

    try {
      // Ensure that the provided ID is a valid ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      // Fetch the file record from MongoDB to get the Pinata CID
      const fileRecord = await collection.findOne({ _id: new ObjectId(id) });

      if (!fileRecord) {
        return res.status(404).json({ message: 'File not found in MongoDB' });
      }

      const pinataCid = fileRecord.pinataCid; // Assuming `pinataCid` is stored in the MongoDB record

      if (!pinataCid) {
        return res.status(404).json({ message: 'Pinata CID not found in the file record' });
      }

      // Step 1: Delete file from Pinata
      const pinataApiKey = '25b25147c472c196555d';
      const pinataSecretApiKey= '4162fa758e5b1cc705b97cc91ab58bb88b956db07d8044c8a75840fbf57dae24';
      const pinataApiUrl = `https://api.pinata.cloud/pinning/unpin/${pinataCid}`;

      const pinataResponse = await fetch(pinataApiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
      });

      if (!pinataResponse.ok) {
        const pinataError = await pinataResponse.json();
        return res.status(500).json({ message: 'Error unpinning from Pinata', error: pinataError });
      }

      // Step 2: Delete file from MongoDB
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        return res.status(200).json({ message: 'File deleted successfully from both MongoDB and Pinata' });
      } else {
        return res.status(404).json({ message: 'File not found in MongoDB' });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({ message: 'Error deleting file', error });
    } finally {
      client.close();  // Closing the connection after operation
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
