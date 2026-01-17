import { X, Copy, Trash2, Download } from 'lucide-react';

const MetadataModal = ({ isOpen, fileMetadata, onClose, onDelete }) => {
  if (!isOpen) return null;

  const handleDownload = (fileMetadata) => {
    const dataStr = JSON.stringify(fileMetadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileMetadata.filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = (fileMetadata) => {
    if (!fileMetadata) return;

    // Format the metadata as plain text
    const metadataText = `
      File Name: ${fileMetadata.filename}
      Upload Date: ${new Date(fileMetadata.uploadDate).toLocaleDateString()}
      ${fileMetadata.metadata ? Object.entries(fileMetadata.metadata).map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2) : value}`).join('\n') : 'No metadata available'}
          `.trim();

    // Copy the text to the clipboard
    navigator.clipboard.writeText(metadataText)
      .then(() => {
        alert('Metadata copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy metadata:', error);
        alert('Failed to copy metadata. Please try again.');
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#f4f4f4] rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-[#5e5e5eff] hover:text-[#1a1a1aff]"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg text-[#1a1a1aff] text-center epilogue font-bold mb-4">
          Metadata of <span className="text-[#f74b25ff]">{fileMetadata?.filename || 'N/A'}</span>
        </h3>
        <div className="overflow-y-auto max-h-96">
        <ul className="list-none text-sm poppins">
          {fileMetadata ? (
            <>
              <li className="mb-2">
                <span className="font-medium capitalize">Name:</span> {fileMetadata.filename}
              </li>
              <li className="mb-2">
                <span className="font-medium capitalize">Upload Date:</span> {new Date(fileMetadata.uploadDate).toLocaleDateString()}
              </li>
              {fileMetadata.metadata ? (
                Object.entries(fileMetadata.metadata).map(([key, value]) => (
                  <li className="mb-2 flex items-center" key={key}>
                    <span className="font-medium capitalize mr-2">{key}:</span>
                    <span className="whitespace-pre-wrap break-words">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                    </span>
                  </li>
                ))
              ) : (
                <li className="mb-2 text-gray-500 poppins">No metadata available</li>
              )}
            </>
          ) : (
            <li className="text-gray-500 poppins">No file selected</li>
          )}
        </ul>
      </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="p-2 bg-[#4CBB17] text-white rounded hover:bg-[#2E8B57]"
            aria-label="Copy File"
            onClick={() => handleCopy(fileMetadata)}
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-[#FF4433] text-white rounded hover:bg-[#D22B2B]"
            aria-label="Delete File"
            onClick={() => onDelete(fileMetadata)}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-[#4169E1] text-white rounded hover:bg-[#0F52BA]"
            aria-label="Download File"
            onClick={() => handleDownload(fileMetadata)}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;