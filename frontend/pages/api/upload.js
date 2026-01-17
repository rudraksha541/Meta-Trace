// /pages/api/upload.js

import formidable from "formidable";

import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import Web3 from "web3";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false,
  },
};

// 🔹 Hardcoded Blockchain & DB Settings

const DB_NAME = "testdb";
const CONTRACT_ADDRESS = "0x1D73f6d2244174D028fcfc17030ae5C41aD3511B";
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io/";
const PRIVATE_KEY = "8d9043fe7be7c70134bc3849a314a545f4da8b0dc207a58b94ff6d20d3220652";
const PINATA_API_KEY = "25b25147c472c196555d";
const PINATA_SECRET_API_KEY = "4162fa758e5b1cc705b97cc91ab58bb88b956db07d8044c8a75840fbf57dae24";

// 🔹 Web3 Setup
let web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
const account = web3.eth.accounts.privateKeyToAccount("0x" + PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// CONTRACT ABI expects the second param to be string (IPFS hash)
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "ipfsHash", type: "string" },
    ],
    name: "storeMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getMetadata",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);



// 🔹 Pinata Upload Function
async function uploadToPinata(filePath, fileName) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), fileName);
  formData.append("pinataMetadata", JSON.stringify({ name: fileName }));
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: Infinity,
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return res.data.IpfsHash;
}

// 🔹 Upload metadata JSON to Pinata and return the IPFS hash
async function uploadMetadataJsonToPinata(metadataObject) {
  const metadataStr = JSON.stringify(metadataObject);
  const blob = Buffer.from(metadataStr);

  const formData = new FormData();
  formData.append("file", blob, "metadata.json");
  formData.append("pinataMetadata", JSON.stringify({ name: "metadata.json" }));
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: Infinity,
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return res.data.IpfsHash;
}

// 🔹 Store IPFS hash on blockchain
async function storeOnBlockchain(tokenId, ipfsHash) {
    try {
        console.log(`📤 Storing IPFS hash on blockchain for Token ID: ${tokenId}`);
        console.log(`📦 IPFS Hash: ${ipfsHash}`);

        const data = contract.methods.storeMetadata(tokenId, ipfsHash).encodeABI();
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gasPrice = await web3.eth.getGasPrice();
        const chainId = await web3.eth.getChainId();

        let estimatedGas;
        try {
            estimatedGas = await web3.eth.estimateGas({
                from: account.address,
                to: CONTRACT_ADDRESS,
                data,
            });
            console.log(`✅ Estimated gas: ${estimatedGas}`);
        } catch (gasError) {
            console.warn("⚠️ Gas estimation failed. Using default fallback of 200,000");
            estimatedGas = 200000;  // fallback gas limit
        }

        const tx = {
            from: account.address,
            to: CONTRACT_ADDRESS,
            gas: estimatedGas,
            gasPrice,
            nonce,
            data,
            chainId,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(`✅ IPFS hash stored on blockchain. TxHash: ${receipt.transactionHash}`);
        return {
            txHash: receipt.transactionHash,
            message: "Stored IPFS hash on blockchain successfully",
        };

    } catch (error) {
        console.error("❌ Blockchain transaction failed:", error);
        throw new Error("Blockchain transaction failed. Check contract, network, or gas.");
    }
}


// 🔹 Formidable wrapper
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// 🔹 API Route Handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    let client;
    let tempFilePath;

    try {
      const { fields, files } = await parseForm(req);
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;

      if (!file || !email) {
        return res.status(400).json({ message: "Missing file or email" });
      }

      tempFilePath = file.filepath;

     

      // Upload file itself to Pinata/IPFS
      const ipfsHash = await uploadToPinata(tempFilePath, file.originalFilename);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      // Send file + email to FastAPI backend for metadata extraction
      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempFilePath), file.originalFilename);
      formData.append("email", email);

      const fastapi = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!fastapi.ok) throw new Error(await fastapi.text());
      const meta = await fastapi.json();
      const { message, ...metaNoMsg } = meta;

      

      const fileRecord = {
        email,
        filename: file.originalFilename,
        
        ipfsUrl,
        pinataCid: ipfsHash,
        type: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
        metadata: metaNoMsg.metadata,
      };

      await uploads.insertOne(fileRecord);

      // Token ID: total documents count (could be improved)
      const tokenId = await uploads.countDocuments();

      // **Upload the metadata JSON to Pinata, get the hash**
      const metadataJsonIpfsHash = await uploadMetadataJsonToPinata(fileRecord.metadata);

      // Store only the IPFS hash of metadata JSON on blockchain
      const receipt = await storeOnBlockchain(tokenId, metadataJsonIpfsHash);

      res.status(200).json({
        message: "Upload complete!",
        metadata: fileRecord,
        metadataJsonIpfsHash,
        blockchainTx: receipt.transactionHash,
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
      if (client) await client.close();
      if (tempFilePath) {
        fs.unlink(tempFilePath, (err) => {
          if (err) console.error("Temp delete failed:", err);
        });
      }
    }
  } else if (req.method === "GET") {
    let client;
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ message: "Email required" });

      
      await client.connect();
      const db = client.db(DB_NAME);
      const files = await db.collection("uploads").find({ email }).sort({ uploadDate: -1 }).toArray();

      res.status(200).json({ files });
    } catch (error) {
      res.status(500).json({ message: "Error fetching files", error: error.message });
    } finally {
      if (client) await client.close();
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
