import { Info, Trash2, Download, ArrowRight, FileImage, FileText, FileVideo, FileMusic, FileArchive, File } from 'lucide-react';
import Link from 'next/link';
import RecLoader from './RecLoader';

const getFileIcon = (fileType) => {
    if (fileType.startsWith('image')) {
      return <FileImage className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType === 'application/pdf' || fileType.includes('word') || fileType === 'text/plain' || fileType.includes('excel')) {
      return <FileText className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType.startsWith('video')) {
      return <FileVideo className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType.startsWith('audio')) {
      return <FileMusic className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else if (fileType === 'application/zip' || fileType.includes('tar')) {
      return <FileArchive className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    } else {
      return <File className="w-7 h-7 object-cover text-[#f74b25ff]" />;
    }
  };

  const handleDownload = (upload) => {
    const dataStr = JSON.stringify(upload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${upload.filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };


const RecentUploads = ({ uploads, onMetadataClick, onDelete, loading}) => {
  const handleDelete = async (upload) => {
    if (!onDelete) {
      console.error("onDelete function is not defined.");
      return;
    }
  
    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/deleteFile?id=${upload._id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          onDelete(upload);
        } else {
          console.error("Failed to delete the file");
        }
      } catch (error) {
        console.error("Error deleting the file:", error);
      }
    }
  };

  const noFiles = uploads.length === 0;
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 epilogue flex justify-between items-center">
              <span>
                Your Recent <span className="text-[#f74b25ff]">Uploads</span>
              </span>
              <Link href="/profile" passHref>
                <button className="flex items-center text-[#1b1b1c] text-sm font-semibold hover:text-[#f74b25ff]">
                  View More
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
    </h3>
    {loading ? ( <div className="flex justify-center align-center items-center h-full">
              <RecLoader /> 
            </div>) : (
          <> 
      <div className="space-y-4 w-full">
        {noFiles ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg poppins">No files found. Upload a file to get started!</p>
          </div>
        ) : (
        uploads.map((upload, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-[#eceaea] shadow-lg rounded w-full"
          >
            <div className="flex items-center space-x-4 w-1/3">
            {getFileIcon(upload.type)}
              <h4 className="font-semibold truncate epilogue w-64">{upload.filename}</h4> {/* Add fixed width and truncate */}
            </div>
            <div className="text-center w-1/3">
              <p className="text-sm text-gray-500 poppins">
                <span className="font-medium">Uploaded on:</span> {new Date(upload.uploadDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4 justify-end w-1/3">
              <button
                className="p-2 bg-[#4CBB17] text-white rounded hover:bg-[#2E8B57]"
                aria-label="View Metadata"
                onClick={() => onMetadataClick(upload)}
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                className="p-2 bg-[#FF4433] text-white rounded hover:bg-[#D22B2B]"
                aria-label="Delete File"
                onClick={() => handleDelete(upload)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 bg-[#4169E1] text-white rounded hover:bg-[#0F52BA]"
                aria-label="Download File"
                onClick={() => handleDownload(upload)}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        )))}
      </div>
      </>
      )}
    </div>
  );
};

export default RecentUploads;
