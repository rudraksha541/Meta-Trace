import React, { useState, useEffect } from "react";
import {
  Upload,
  FolderSearch,
  List,
  BrainCog,
  Smile,
  Frown,
  FileText,
} from "lucide-react";
import AILoader from "./AILoader";

const MetadataAndRecommendations = ({ metadata, onBackToUpload, onMintNFT }) => {
  // State variables
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState(null);

  // Fetch AI analysis on metadata change
  useEffect(() => {
    if (metadata) {
      fetchAnalysis();
    }
  }, [metadata]);

  // Fetch AI analysis from backend
  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      console.log("📤 Sending metadata to backend:", metadata);
      const response = await fetch("http://127.0.0.1:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });

      const data = await response.json();
      console.log("📥 Received response from backend:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analysis");
      }
      setAiResponse(data);
    } catch (error) {
      console.error("❌ Error fetching analysis:", error);
      setAiResponse({
        anomaly_detected: true,
        reason: `Error: ${error.message}`,
        recommendations: [],
        best_practices: [],
        metadata_summary: {
          brief_summary: { title: "File Properties Overview", content: [] },
          authenticity: { title: "Authenticity & Manipulation Analysis", content: [] },
          metadata_table: { title: "Metadata Analysis Table", headers: [], rows: [] },
          use_cases: { title: "Recommended Applications", content: [] },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FolderSearch className="w-6 h-6 mr-2 text-[#ef4d31ff]" />
          <h3 className="text-2xl font-bold text-[#1b1b1cff] epilogue">
            File Analysis for{" "}
            <span className="text-[#ef4d31ff]">{metadata?.filename || "File"}</span>
          </h3>
        </div>
        <button
          onClick={onBackToUpload}
          className="p-3 rounded-lg hover:bg-[#D22B2B] bg-[#ef4d31ff] transition-colors flex items-center justify-center font-semibold epilogue"
        >
          <Upload className="w-5 h-5 mr-2 text-md text-[#000000]" />
          <span className="text-[#000000] text-md">Upload</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Metadata & Anomaly Detection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metadata */}
          <div className="bg-[#f7f7f7ff] p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <List className="w-5 h-5 mr-2 text-[#ef4d31ff]" />
              <h4 className="text-lg font-bold epilogue">Metadata</h4>
            </div>
            <div className="overflow-y-auto max-h-80">
              <ul className="list-none text-sm poppins">
                {metadata?.metadata ? (
                  Object.entries(metadata.metadata).map(([key, value]) => (
                    <li className="mb-2 flex items-center" key={key}>
                      <span className="font-medium capitalize mr-2">{key}:</span>
                      <span className="whitespace-pre-wrap break-words">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 poppins">No metadata available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Anomaly Detection */}
          <div className="bg-[#f7f7f7ff] p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <BrainCog className="w-5 h-5 mr-2 text-[#ef4d31ff]" />
              <h4 className="text-lg font-bold epilogue">Anomaly Detection</h4>
            </div>
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <AILoader />
                </div>
              ) : aiResponse ? (
                <div className="flex flex-col items-center justify-center text-center">
                  {aiResponse.anomaly_detected ? (
                    <>
                      <Frown className="w-16 h-16 text-[#ef4d31ff] mb-4" />
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <p className="text-sm text-red-700 poppins">
                          <strong>Anomalies Detected:</strong>
                          <br />
                          {aiResponse.reason}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Smile className="w-16 h-16 text-[#4CBB17] mb-4" />
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <p className="text-sm text-green-700 poppins">
                          <strong>No Anomalies Found:</strong>
                          <br />
                          {aiResponse.reason}
                        </p>
                      </div>
                    </>
                  )}

                  {aiResponse.anomaly_detected ? (
                    <>
                      <p className="text-sm text-[#000000] poppins mb-2">
                        <strong>Recommended Actions</strong>
                      </p>
                      <ul className="list-disc pl-4 text-left text-sm text-gray-700 poppins">
                        {(aiResponse.recommendations || []).map((rec, index) => (
                          <li key={index} className="mb-2">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[#000000] poppins mb-2">
                        <strong>Best Practices</strong>
                      </p>
                      <ul className="list-disc pl-4 text-left text-sm text-gray-700 poppins">
                        {(aiResponse.best_practices || []).map((practice, index) => (
                          <li key={index} className="mb-2">
                            {practice}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-700 poppins">No analysis available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Analysis */}
        <div className="bg-[#f7f7f7ff] p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 mr-2 text-[#ef4d31ff]" />
            <h4 className="text-lg font-bold epilogue">Metadata Analysis</h4>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <AILoader />
              </div>
            ) : aiResponse?.metadata_summary ? (
              <div className="space-y-6">
                {/* Brief Summary */}
                {aiResponse.metadata_summary.brief_summary && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2">
                      {aiResponse.metadata_summary.brief_summary.title}
                    </h5>
                    <div className="text-sm text-gray-700 poppins">
                      {aiResponse.metadata_summary.brief_summary.content.map((item, index) => (
                        <p key={index} className="mb-1">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authenticity Analysis */}
                {aiResponse.metadata_summary.authenticity && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2">
                      {aiResponse.metadata_summary.authenticity.title}
                    </h5>
                    <div className="text-sm text-gray-700 poppins">
                      {aiResponse.metadata_summary.authenticity.content.map((item, index) => (
                        <p key={index} className="mb-1">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Table */}
                {aiResponse.metadata_summary.metadata_table && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2">
                      {aiResponse.metadata_summary.metadata_table.title}
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {aiResponse.metadata_summary.metadata_table.headers.map((header, index) => (
                              <th
                                key={index}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {aiResponse.metadata_summary.metadata_table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className={`px-4 py-2 text-sm poppins ${
                                    cellIndex === 2
                                      ? cell === "normal"
                                        ? "text-green-600"
                                        : cell === "suspicious"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Use Cases */}
                {aiResponse.metadata_summary.use_cases && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#ef4d31ff] mb-2">
                      {aiResponse.metadata_summary.use_cases.title}
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 poppins">
                      {aiResponse.metadata_summary.use_cases.content.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-700 poppins">No metadata analysis available</p>
            )}
          </div>
        </div>

        {/* Mint NFT Button */}
        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={onMintNFT}
            disabled={minting}
            className={`px-6 py-3 rounded-lg font-semibold epilogue text-white ${
              minting ? "bg-gray-400 cursor-not-allowed" : "bg-[#ef4d31ff] hover:bg-[#D22B2B]"
            }`}
          >
            {minting ? "Minting..." : "Mint NFT"}
          </button>
          {mintStatus && (
            <p
              className={`mt-3 text-sm font-medium ${
                mintStatus.toLowerCase().includes("failed") ? "text-red-600" : "text-green-600"
              }`}
            >
              {mintStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataAndRecommendations;
