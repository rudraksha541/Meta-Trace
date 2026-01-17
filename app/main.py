import os
import json
import hashlib
import re
import subprocess
import datetime
import threading
import time
import mimetypes
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
from eth_account.messages import encode_defunct
from PIL import Image


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained Random Forest tampering detection model
MODEL_PATH = "./tampering_rf_model.pkl"
try:
    rf_model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"❌ Model loading failed: {str(e)}")


def extract_metadata(file_path: str):
    try:
        result = subprocess.run(
            ["exiftool", "-json", file_path],
            capture_output=True,
            text=True,
            check=True,
        )
        metadata_list = json.loads(result.stdout)
        return metadata_list[0] if metadata_list else {}

    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="ExifTool not found. Please install it.")
    except subprocess.CalledProcessError:
        raise HTTPException(status_code=500, detail="Error extracting metadata.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid metadata format.")

def preprocess_metadata(metadata: dict):
    """ Convert metadata into a numerical format for Isolation Forest. """
    try:
        df = pd.DataFrame([metadata])  # Convert dictionary to DataFrame
        
        # Select only numeric columns (filtering out non-numeric metadata)
        df_numeric = df.select_dtypes(include=[np.number])

        if df_numeric.empty:
            raise ValueError("No numeric metadata found for anomaly detection.")
        
        return df_numeric.values  # Convert to NumPy array for model prediction
    except Exception as e:
        print(f"❌ Metadata preprocessing failed: {str(e)}")
        return None


# ========== Configuration ==========
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io/"
CONTRACT_ADDRESS = "0x1D73f6d2244174D028fcfc17030ae5C41aD3511B"
PRIVATE_KEY = "Your key"
# Web3 setup
web3 = Web3(Web3.HTTPProvider(RPC_URL))
account = web3.eth.account.from_key(PRIVATE_KEY)

# Smart contract ABI
contract_abi = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "string", "name": "jsonData", "type": "string"}
        ],
        "name": "storeMetadata",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "getMetadata",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# MetaTraceNFT ABI (for XCM/NFT transfer)
metatrace_abi = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "from", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "origin", "type": "address"},
            {"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "targetChain", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "uri", "type": "string"},
        ],
        "name": "NFTShared",
        "type": "event"
    }
]

NFT_CONTRACT_ADDRESS = "0x787ad5e085AD69F2B660f2f0Eff19786c776BF13"
nft_contract = web3.eth.contract(address=NFT_CONTRACT_ADDRESS, abi=metatrace_abi)

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)

GEMINI_API_KEY = "AIzaSyB1QiMcUVr8Y22M9bkAFwmfe9KXho9c"


# ========== Helper Functions ==========
def calculate_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def get_next_token_id() -> int:
    return web3.eth.get_transaction_count(account.address)

def store_metadata_on_chain(metadata: dict) -> dict:
    try:
        metadata_str = json.dumps(metadata)
        token_id = get_next_token_id()
        nonce = web3.eth.get_transaction_count(account.address)
        chain_id = web3.eth.chain_id
        gas_price = web3.eth.gas_price

        gas_estimate = contract.functions.storeMetadata(token_id, metadata_str).estimate_gas({
            'from': account.address,
        })

        txn = contract.functions.storeMetadata(token_id, metadata_str).build_transaction({
            'from': account.address,
            'gas': gas_estimate,
            'gasPrice': gas_price,
            'nonce': nonce,
            'chainId': chain_id,
        })

        balance = web3.eth.get_balance(account.address)
        estimated_fee = gas_estimate * gas_price
        if balance < estimated_fee:
            raise Exception(f"Insufficient balance to cover gas fee: Balance {balance}, Estimated fee {estimated_fee}")

        signed_txn = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"✅ Blockchain Transaction Successful! Tx Hash: {tx_hash.hex()}")

        return {
            "tx_hash": tx_hash.hex(),
            "token_id": token_id
        }
    except Exception as e:
        print(f"❌ Blockchain Storage Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Blockchain storage failed: {str(e)}")

# ========== API Endpoints ==========
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), email: str = Form(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        content = await file.read()
        file_hash = calculate_file_hash(content)

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        metadata = extract_metadata(file_path)
        os.remove(file_path)

        metadata.update({
            "fileHash": file_hash,
            "originalFilename": file.filename,
            "uploaderEmail": email,
            "timestamp": str(datetime.datetime.utcnow())
        })

        blockchain_response = store_metadata_on_chain(metadata)

        return JSONResponse(
            content={
                "message": "File uploaded, metadata extracted, and stored on blockchain",
                "metadata": metadata,
                **blockchain_response
            },
            status_code=200,
        )
    except Exception as e:
        print(f"❌ Upload Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


def listen_to_nft_shared_events():
    print("🔄 Starting XCM listener for NFTShared events...")
    try:
        event_filter = nft_contract.events.NFTShared.create_filter(fromBlock='latest')
    except Exception as e:
        print("❌ Failed to create event filter:", e)
        return

    while True:
        try:
            for event in event_filter.get_new_entries():
                from_address = event["args"]["from"]
                token_id = event["args"]["tokenId"]
                target_chain = event["args"]["targetChain"]
                uri = event["args"]["uri"]

                print("📡 NFTShared event detected!")
                print(f"👤 From: {from_address}")
                print(f"🆔 Token ID: {token_id}")
                print(f"🌉 Target Chain: {target_chain}")
                print(f"🖼️ URI: {uri}")

                simulate_cross_chain_transfer(from_address, token_id, target_chain, uri)

        except Exception as e:
            print("❌ Listener error:", str(e))
        time.sleep(5)

def simulate_cross_chain_transfer(from_address, token_id, target_chain, uri):
    print(f"🚀 Simulating NFT transfer to {target_chain}")
    print(f"🎨 Token #{token_id} from {from_address} → {target_chain}")
    print(f"🔗 Metadata URI: {uri}")

@app.post("/log-xcm")
async def log_xcm(request: Request):
    data = await request.json()

    from_addr = data.get("from")
    token_id = data.get("tokenId")
    target_chain = data.get("targetChain")
    token_uri = data.get("uri")
    tx_hash = data.get("txHash", "unknown")

    if not all([from_addr, token_id, target_chain, token_uri]):
        return JSONResponse(content={"error": "Missing data"}, status_code=400)

    log_entry = {
        "from": from_addr,
        "tokenId": token_id,
        "targetChain": target_chain,
        "tokenURI": token_uri,
        "txHash": tx_hash,
        "status": "pending",
        "timestamp": datetime.datetime.utcnow()
    }

    shared_collection.insert_one(log_entry)

    print("📦 [XCM LOGGED] Token:", token_id, "→", target_chain)
    return {"message": "✅ Share logged"}

@app.post("/snapshot/")
async def sign_and_store_snapshot(token_id: int):
    try:
        metadata_str = contract.functions.getMetadata(token_id).call()
        message = encode_defunct(text=metadata_str)
        signature = web3.eth.account.sign_message(message, private_key=PRIVATE_KEY)

        snapshot_doc = {
            "tokenId": token_id,
            "owner": account.address,
            "signed_metadata": metadata_str,
            "signature": signature.signature.hex(),
            "timestamp": str(datetime.datetime.utcnow())
        }

        snapshot_collection.insert_one(snapshot_doc)

        return {
            "message": "Snapshot signed and stored.",
            "tokenId": token_id,
            "signature": signature.signature.hex()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





MODEL_PATH = "./tampering_rf_model.pkl"
try:
    rf_model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"❌ Model loading failed: {str(e)}")

# Extract metadata using ExifTool
def extract_metadata(file_path: str):
    try:
        result = subprocess.run(
            ["exiftool", "-json", file_path],
            capture_output=True,
            text=True,
            check=True,
        )
        metadata_list = json.loads(result.stdout)
        return metadata_list[0] if metadata_list else {}
    except Exception as e:
        return {}

# Preprocess metadata for model
def preprocess_metadata(metadata: dict):
    try:
        df = pd.DataFrame([metadata])
        df_numeric = df.select_dtypes(include=[np.number])
        return df_numeric if not df_numeric.empty else None
    except:
        return None

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    temp_path = None
    try:
        with NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await file.read())

        file_type = mimetypes.guess_type(file.filename)[0] or "unknown"
        metadata = extract_metadata(temp_path)

        # Remove common system-generated fields
        ignore_keys = [
            "SourceFile", "FileModifyDate", "FileAccessDate", "FileCreateDate",
            "Directory", "FileName"
        ]
        filtered_metadata = {k: v for k, v in metadata.items() if k not in ignore_keys}

        if len(filtered_metadata) < 5:
            return JSONResponse(content={"tampered": False, "message": "No useful metadata found"}, status_code=200)

        df_numeric = preprocess_metadata(filtered_metadata)
        if df_numeric is None:
            return JSONResponse(content={"tampered": False, "message": "No numeric metadata to analyze"}, status_code=200)

        prediction = rf_model.predict(df_numeric)[0]  # 1 = tampered, 0 = original
        probability = rf_model.predict_proba(df_numeric)[0][1]  # confidence of tampering

        if prediction == 1:
            return JSONResponse(content={
                "tampered": True,
                "confidence": round(probability * 100, 2),
                "message": "Metadata indicates the file is likely tampered."
            }, status_code=200)
        else:
            return JSONResponse(content={
                "tampered": False,
                "confidence": round((1 - probability) * 100, 2),
                "message": "No signs of tampering found in metadata."
            }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as pe:
                print("⚠ Could not delete file:", pe)

from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from fastapi import APIRouter
from tempfile import NamedTemporaryFile
from PIL import Image
import os, json, mimetypes, google.generativeai as genai

from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from tempfile import NamedTemporaryFile
from PIL import Image
import os, json, mimetypes
import google.generativeai as genai




@app.post("/analyze1")
async def analyze_file(file: UploadFile = File(...)):
    temp_path = None
    try:
        with NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await file.read())

        filename = file.filename
        file_type = mimetypes.guess_type(filename)[0] or "unknown"
        metadata = extract_metadata(temp_path)

        if not metadata:
            return JSONResponse(content={"anomaly_detected": False, "message": "No metadata found"}, status_code=200)

        # Ignore system-generated fields
        ignore_keys = [
            "SourceFile", "FileModifyDate", "FileAccessDate", "FileCreateDate",
            "Directory", "FileName"
        ]
        filtered_metadata = {k: v for k, v in metadata.items() if k not in ignore_keys}

        if len(filtered_metadata) < 5:
            return JSONResponse(content={"anomaly_detected": False, "message": "No anomaly detected"}, status_code=200)

        metadata_str = json.dumps(filtered_metadata, indent=2)
        model = genai.GenerativeModel("gemini-1.5-flash")

        def build_anomaly_prompt(context_type):
            return f"""
You are a digital forensics expert.

Here is metadata extracted from a {context_type} file. Your job:
- Examine all metadata fields for inconsistencies or suspicious patterns.
- Examples of anomalies include:
  - Conflicting or illogical timestamps (e.g., modified before created)
  - Metadata showing usage of multiple or suspicious tools
  - Missing key fields that are expected
  - Edited tags, re-encoding, software mismatches
  - Embedded GPS/location inconsistencies
  - Any values that seem out of place for a normal file of this type

✅ Do NOT include the following fields in your analysis:
- SourceFile, FileModifyDate, FileAccessDate, FileCreateDate, Directory, FileName

Return a structured list of all anomalies found (numbered format).
If fewer than 5 are found, reply with: "No anomaly detected."

Metadata to analyze:
{metadata_str}
"""

        # IMAGE: Use vision + metadata
        if "image" in file_type:
            try:
                with Image.open(temp_path) as image:
                    prompt = build_anomaly_prompt("image")
                    response = model.generate_content([prompt, image])
                    result = response.text.strip()

                    lines = [line for line in result.splitlines() if line.strip() and line.strip()[0] in "1234567890•*-"]
                    anomaly_count = len(lines)

                    if "no anomaly" in result.lower() or anomaly_count < 5:
                        return JSONResponse(content={"anomaly_detected": False, "message": "No anomaly detected"}, status_code=200)
                    else:
                        return JSONResponse(content={
                            "anomaly_detected": True,
                            "anomaly_count": anomaly_count,
                            "analysis": result
                        }, status_code=200)
            except Exception as e:
                print("⚠ Vision model failed:", str(e))
                return JSONResponse(content={"error": "Image analysis failed."}, status_code=500)

        # DOCUMENT: Just use metadata
        elif any(ft in file_type for ft in ["pdf", "word", "text", "msword", "officedocument", "plain", "application", "code", "text/x"]):
            try:
                chat = model.start_chat()
                prompt = build_anomaly_prompt("document or digital file")
                response = chat.send_message(prompt)
                result = response.text.strip()

                lines = [line for line in result.splitlines() if line.strip() and line.strip()[0] in "1234567890•*-"]
                anomaly_count = len(lines)

                if "no anomaly" in result.lower() or anomaly_count < 5:
                    return JSONResponse(content={"anomaly_detected": False, "message": "No anomaly detected"}, status_code=200)
                else:
                    return JSONResponse(content={
                        "anomaly_detected": True,
                        "anomaly_count": anomaly_count,
                        "analysis": result
                    }, status_code=200)
            except Exception as e:
                return JSONResponse(content={"error": "Document analysis failed."}, status_code=500)

        return JSONResponse(content={"anomaly_detected": False, "message": "Unsupported file type"}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as pe:
                print("⚠ Could not delete file:", pe)


# Explanation route
explain_router = APIRouter()

@explain_router.post("/explain")
async def explain_metadata(metadata: dict):
    try:
        if not metadata:
            return JSONResponse(content={"error": "No metadata provided"}, status_code=400)

        metadata_str = json.dumps(metadata, indent=2)
        GEMINI_API_KEY = ""
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        You are a helpful AI assistant who explains file metadata to non-technical users.

        Below is a JSON metadata dump. For each metadata field:
        - Tell what it means in plain English
        - Summarize what the value indicates
        - Avoid technical language unless needed
        - Do not mention tampering, editing, or anomaly detection

        Format the response in clean bullet points or paragraphs so it's easy to understand.

        Metadata to explain:
        {metadata_str}
        """

        response = model.generate_content(prompt)
        summary = response.text.strip()

        return JSONResponse(content={"summary": summary}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

app.include_router(explain_router)
