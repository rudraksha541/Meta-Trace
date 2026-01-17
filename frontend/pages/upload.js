import Navbar from '@/components/Navbar';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { CloudUpload } from 'lucide-react';
import Footer from '@/components/Footer';
import RecentUploads from '@/components/RecentUploads';
import MetadataModal from '@/components/MetadataModal';
import { useRouter } from 'next/router';
import MetadataAndRecommendations from '@/components/MetadataRecommendations';
import UploadLoader from '@/components/UploadLoader';
import Web3 from 'web3';
import axios from 'axios';

// --- START OF NETWORK CONFIGURATIONS ---
// IMPORTANT: You MUST replace 'YOUR_INFURA_PROJECT_ID' with your actual Infura Project ID.
// IMPORTANT: You MUST replace 'YOUR_AVALANCHE_CONTRACT_ADDRESS', etc., with your actual deployed contract addresses
// on each respective network if they are different from the Ethereum/Passet Hub one.
const NETWORKS = {
  ethereum: {
    chainId: '0x1', // Ethereum Mainnet (1 in decimal)
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'], // Replace with your Infura Project ID
    blockExplorerUrls: ['https://etherscan.io'],
    contractAddress: '0x764c2e97d8AC0BfD86A502cBC1544c7eEec38866', // Your existing contract address (assuming it's on Ethereum)
  },
  goerli: { // Example: Goerli Testnet for Ethereum
    chainId: '0x5', // Goerli Testnet (5 in decimal)
    chainName: 'Goerli Testnet',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'GoerliETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID'], // Replace with your Infura Project ID
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    contractAddress: 'YOUR_GOERLI_CONTRACT_ADDRESS', // <<< CHANGE THIS: If your contract is deployed on Goerli
  },
  avalanche: {
    chainId: '0xa86a', // Avalanche C-Chain Mainnet (43114 in decimal)
    chainName: 'Avalanche C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/'],
    contractAddress: 'YOUR_AVALANCHE_CONTRACT_ADDRESS', // <<< CHANGE THIS: Deploy your contract on Avalanche and put its address here.
  },
  arbitrum: {
    chainId: '0xa4b1', // Arbitrum One Mainnet (42161 in decimal)
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io/'],
    contractAddress: 'YOUR_ARBITRUM_CONTRACT_ADDRESS', // <<< CHANGE THIS: Deploy your contract on Arbitrum and put its address here.
  },
  base: {
    chainId: '0x2105', // Base Mainnet (8453 in decimal)
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org/'],
    contractAddress: 'YOUR_BASE_CONTRACT_ADDRESS', // <<< CHANGE THIS: Deploy your contract on Base and put its address here.
  },
  passethub: {
    chainId: '0x190F1B45', // 420420421 in decimal, correctly converted to hex
    chainName: 'Passet Hub',
    nativeCurrency: {
      name: 'Passet',
      symbol: 'PAS', // As per your request
      decimals: 18,
    },
    rpcUrls: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
    blockExplorerUrls: ['https://blockscout-passet-hub.parity-testnet.parity.io/'],
    contractAddress: '0x764c2e97d8AC0BfD86A502cBC1544c7eEec38866', // As per your request
  },
};
// --- END OF NETWORK CONFIGURATIONS ---


const Upload = () => {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [fileEnter, setFileEnter] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileMetadata, setSelectedFileMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [recentUploadMetadata, setRecentUploadMetadata] = useState(null);
  const [walletAddress, setWalletAddress] = useState(''); // Renamed from 'account' for consistency
  const [currentChainId, setCurrentChainId] = useState(null);
  const [showNetworkSwitchDialog, setShowNetworkSwitchDialog] = useState(false);

  // This hardcoded contract address is now largely superseded by the NETWORKS object,
  // but keeping it as it was in your original code.
  const contractAddress = '0x764c2e97d8AC0BfD86A502cBC1544c7eEec38866';

  // --- START OF CONTRACT ABI (as provided by you) ---
  const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "mint",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  // --- END OF CONTRACT ABI ---

  useEffect(() => {
    fetchUserEmail();
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      web3.eth.getChainId().then(chainId => {
        const hexChainId = web3.utils.toHex(chainId);
        setCurrentChainId(hexChainId);
        checkNetworkCompatibility(hexChainId);
      }).catch(console.error);

      window.ethereum.on('chainChanged', (chainId) => {
        setCurrentChainId(chainId);
        checkNetworkCompatibility(chainId);
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress('');
          console.log("Disconnected from wallet.");
        } else {
          setWalletAddress(accounts[0]);
          console.log("New account:", accounts[0]);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchUploadedFiles();
    }
  }, [userEmail]);

  // Helper function to get contract address based on current network
  const getContractAddress = (chainId) => {
    const networkInfo = Object.values(NETWORKS).find(net => net.chainId === chainId);
    return networkInfo ? networkInfo.contractAddress : null;
  };

  // Checks if the current connected network is one of the supported networks
  const checkNetworkCompatibility = (currentChainId) => {
    const supportedChainIds = Object.values(NETWORKS).map(net => net.chainId);
    if (!supportedChainIds.includes(currentChainId)) {
      setShowNetworkSwitchDialog(true);
    } else {
      setShowNetworkSwitchDialog(false);
    }
  };

  // Function to request MetaMask to switch to a specific network
  const switchEthereumNetwork = async (networkKey) => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to switch networks.");
      return;
    }

    const targetNetwork = NETWORKS[networkKey];
    if (!targetNetwork) {
      console.error("Invalid network key provided.");
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      console.log(`Switched to ${targetNetwork.chainName}`);
      setCurrentChainId(targetNetwork.chainId);
      setShowNetworkSwitchDialog(false);
    } catch (switchError) {
      if (switchError.code === 4902) {
        // This error code indicates that the chain has not been added to MetaMask.
        // MetaMask will show a dialog to the user prompting them to add the network.
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetNetwork.chainId,
              chainName: targetNetwork.chainName,
              nativeCurrency: targetNetwork.nativeCurrency,
              rpcUrls: targetNetwork.rpcUrls,
              blockExplorerUrls: targetNetwork.blockExplorerUrls,
            }],
          });
          console.log(`Added and switched to ${targetNetwork.chainName}`);
          setCurrentChainId(targetNetwork.chainId);
          setShowNetworkSwitchDialog(false);
        } catch (addError) {
          console.error("Failed to add network:", addError);
          alert(`Failed to add ${targetNetwork.chainName}. Please add it manually to MetaMask.`);
        }
      } else {
        console.error("Failed to switch network:", switchError);
        alert(`Failed to switch to ${targetNetwork.chainName}.`);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);

      const web3 = new Web3(window.ethereum);
      const chainId = await web3.eth.getChainId();
      const hexChainId = web3.utils.toHex(chainId);
      setCurrentChainId(hexChainId);
      checkNetworkCompatibility(hexChainId);

    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet.');
    }
  };

  const fetchUserEmail = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const userData = await response.json();
      setUserEmail(userData.email);
    } catch {
      router.push('/login');
    }
  };

  const validateFileType = (file) => {
    if (!file) return false;
    const allowedFileTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg',
      'audio/wav', 'audio/ogg', 'application/zip', 'application/x-tar', 'application/gzip'
    ];
    const validExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.pdf', '.doc', '.docx', '.txt',
      '.xls', '.xlsx', '.csv', '.mp4', '.webm', '.mov', '.mp3', '.wav', '.ogg',
      '.zip', '.tar', '.gz', '.webp'
    ];
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    return allowedFileTypes.includes(file.type) || validExtensions.includes(fileExtension);
  };


  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/upload?email=${encodeURIComponent(userEmail)}`);
      if (!res.ok) throw new Error('Failed to fetch uploads');
      const data = await res.json();
      const sortedFiles = data.files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentUploads(sortedFiles.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile || !validateFileType(uploadedFile)) {
      alert('Unsupported file type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('email', userEmail);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setSelectedFileMetadata({ ...data.metadata, filename: uploadedFile.name });
      setShowMetadata(true);
      fetchUploadedFiles();
      setFile(uploadedFile);
    } catch {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setFileEnter(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const syntheticEvent = { target: { files: [droppedFile] } };
      handleFileChange(syntheticEvent);
    }
  };

  const handleMintNFT = async () => {
    if (!selectedFileMetadata || !file || !walletAddress) {
      alert('Missing file, metadata, or wallet');
      return;
    }

    // Dynamically get the contract address based on the current connected network
    const targetContractAddress = getContractAddress(currentChainId);
    if (!targetContractAddress) {
      alert('No contract deployed on the current connected network. Please switch to a supported network.');
      setShowNetworkSwitchDialog(true); // Show the network switch dialog
      return; // Stop the minting process
    }

    try {
      const web3 = new Web3(window.ethereum);

      const imageFormData = new FormData();
      imageFormData.append('file', file);

      const pinataApiKey = '25b25147c472c196555d';
      const pinataSecretApiKey = '4162fa758e5b1cc705b97cc91ab58bb88b956db07d8044c8a75840fbf57dae24';

      const imageRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', imageFormData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey
        }
      });

      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageRes.data.IpfsHash}`;
      const attributes = Object.entries(selectedFileMetadata).map(([key, value]) => ({
        trait_type: key,
        value
      }));

      const metadata = {
        name: selectedFileMetadata.filename || "Ecovisit",
        description: "Metadata generated by MetaTrace platform",
        image: imageUrl,
        attributes
      };

      const metadataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataMetadata: { name: metadata.name },
        pinataContent: metadata
      }, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey
        }
      });

      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataRes.data.IpfsHash}`;
      // Use the dynamically selected contract address
      const contract = new web3.eth.Contract(contractABI, targetContractAddress);

      await contract.methods.mint(walletAddress, tokenURI).send({
        from: walletAddress,
        maxFeePerGas: web3.utils.toWei('0.01', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('0.01', 'gwei')
      });

      alert('✅ NFT minted successfully!');
    } catch (err) {
      console.error('Minting error:', err);
      // More detailed error handling for user feedback
      if (err.code === 4001) {
        alert('❌ Minting failed: User denied the transaction.');
      } else if (err.message && err.message.includes('insufficient funds')) {
        alert('❌ Minting failed: Insufficient funds in your wallet.');
      } else if (err.message && err.message.includes('gas required exceeds allowance')) {
        alert('❌ Minting failed: Gas limit too low or transaction complexity too high.');
      } else {
        alert('❌ Minting failed. Check console for details.');
      }
    }
  };

  const handleMetadataClick = (metadata) => {
    setRecentUploadMetadata(metadata);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setRecentUploadMetadata(null);
  };

  const handleDelete = async (uploadId) => {
    if (!uploadId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/upload/${uploadId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUploadedFiles();
        setIsModalOpen(false);
      } else {
        alert('Failed to delete the file.');
      }
    } catch {
      alert('Error deleting the file.');
    } finally {
      setLoading(false);
    }
  };

  // The handleModDelete function is redundant if handleDelete is already being used directly.
  // Keeping it as it was in your provided code for minimal alteration, but it just calls handleDelete.
  const handleModDelete = (uploadId) => {
    handleDelete(uploadId);
  };

  return (
    <>
      <Head><title>Upload your File | MetaTrace</title></Head>
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />

        <div className="px-9 flex flex-col py-8 justify-center">
          <div className="mb-6 text-right">
            {walletAddress ? (
              <p className="text-sm text-gray-600">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
              >
                Connect Wallet
              </button>
            )}
            {currentChainId && (
              <p className="text-sm text-gray-600 mt-1">
                Network: {Object.values(NETWORKS).find(net => net.chainId === currentChainId)?.chainName || 'Unsupported Network'}
              </p>
            )}
          </div>

          {showNetworkSwitchDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
                <h3 className="text-xl font-bold mb-4">Switch Networks</h3>
                <p className="text-gray-700 mb-6">
                  This app does not support the current connected network. Switch or disconnect to continue.
                </p>
                <div className="space-y-3">
                  {Object.entries(NETWORKS).map(([key, network]) => (
                    // This condition hides network buttons if their contract address is still a placeholder like 'YOUR_...'
                    network.contractAddress && network.contractAddress.includes('YOUR_') ? null : (
                      <button
                        key={key}
                        onClick={() => switchEthereumNetwork(key)}
                        className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        {network.chainName}
                      </button>
                    )
                  ))}
                  <hr className="my-4" />
                  <button
                    onClick={() => {
                      setWalletAddress('');
                      setCurrentChainId(null);
                      setShowNetworkSwitchDialog(false);
                      alert("Wallet disconnected.");
                    }}
                    className="w-full py-3 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}


          {showMetadata ? (
            <MetadataAndRecommendations
              metadata={selectedFileMetadata}
              onBackToUpload={() => setShowMetadata(false)}
              onMintNFT={handleMintNFT}
            />
          ) : uploading ? (
            <div className="flex items-center justify-center h-full"><UploadLoader /></div>
          ) : (
            <div className="upload-container">
              <h2 className="text-3xl font-black mb-2 epilogue text-center">
                Upload Your <span className="text-[#f74b25ff]">File</span>
              </h2>
              <p className="text-[#5e5e5eff] poppins mb-4 text-lg text-center">
                Securely upload and manage your files in one place.
              </p>

              <div
                onClick={() => document.getElementById('file-upload').click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setFileEnter(true);
                }}
                onDragLeave={() => setFileEnter(false)}
                onDrop={handleFileDrop}
                className={`border-dashed border-2 rounded-lg p-8 w-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                  fileEnter ? 'border-[#1b1b1cff] bg-[#fbb3a3]' : 'border-[#1b1b1cff] bg-[#fbb3a3]'
                }`}
              >
                <CloudUpload className="w-16 h-16 text-[#1c1c1cff] mb-4" />
                <p className="text-[#1c1c1cff] font-semibold poppins">
                  Drag & drop your files here or click to upload
                </p>
                <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
              </div>
            </div>
          )}

          <RecentUploads
            uploads={recentUploads}
            onMetadataClick={handleMetadataClick}
            onDelete={handleDelete}
            loading={loading}
          />

          <MetadataModal
            isOpen={isModalOpen}
            fileMetadata={recentUploadMetadata}
            onClose={handleModalClose}
            onDelete={handleModDelete} // Use handleModDelete if it has specific logic, otherwise handleDelete directly
          />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Upload;
