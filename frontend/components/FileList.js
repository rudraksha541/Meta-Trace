import { Info, Trash2, Download, FileImage, FileText, FileVideo, FileMusic, FileArchive, File, Upload } from 'lucide-react';
import { useRouter } from 'next/router';

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

export default function FileList({ files, onDelete, onMetadataClick, onAllDelete }) {
  const router = useRouter();

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
          onDelete(upload); // Call onDelete to update UI
        } else {
          console.error("Failed to delete the file");
        }
      } catch (error) {
        console.error("Error deleting the file:", error);
      }
    }
  };

  const handleDownloadAll = () => {
    const dataStr = JSON.stringify(files, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_files.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all files?");
    if (confirmDelete) {
      try {
        const response = await fetch('/api/deleteAllFiles', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileIds: files.map((file) => file._id) }),
        });

        if (response.ok) {
          onAllDelete(null); // Clear the files state
        } else {
          console.error("Failed to delete all files");
        }
      } catch (error) {
        console.error("Error deleting all files:", error);
      }
    }
  };

  const handleUpload = () => {
    router.push('/upload');
  };

  const noFiles = files.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 epilogue">
          File <span className="text-[#ef4d31ff]">History</span>
        </h2>
        <div className="flex items-center space-x-3">
          <button
            className={`p-2 rounded-lg transition-colors flex items-center justify-center font-semibold epilogue ${
              noFiles ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#0F52BA]'
            }`}
            onClick={handleDownloadAll}
            disabled={noFiles}
          >
            <Download className="w-5 h-5 mr-2 text-[#4169E1]" />
            <span className='text-[#4169E1]'>Download All</span>
          </button>
          <button
            className={`p-2 rounded-lg transition-colors flex items-center justify-center font-semibold epilogue ${
              noFiles ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#D22B2B]'
            }`}
            onClick={handleDeleteAll}
            disabled={noFiles}
          >
            <Trash2 className="w-5 h-5 mr-2 text-[#FF4433]" />
            <span className='text-[#FF4433]'>Delete All</span>
          </button>
          <button
            className="p-2 rounded-lg hover:text-[#2E8B57] transition-colors flex items-center justify-center font-semibold epilogue"
            onClick={handleUpload}
          >
            <Upload className="w-5 h-5 mr-2 text-[#4CBB17]" />
            <span className='text-[#4CBB17]'>Upload</span>
          </button>
        </div>
      </div>

      <div className="bg-[#fefefa] rounded-xl shadow-md p-6">
        {noFiles ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg poppins">No files found. Upload a file to get started!</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-lg font-semibold text-gray-800 poppins">File Name</th>
                <th className="py-3 px-4 text-lg font-semibold text-gray-800 poppins">Upload Date</th>
                <th className="py-3 px-4 text-lg font-semibold text-gray-800 poppins">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 flex items-center">
                    <div className="mr-3 flex-shrink-0 w-7 h-7">
                      {getFileIcon(file.type)}
                    </div>
                    <span className="text-gray-700 font-medium epilogue">{file.filename}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 poppins">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex items-center justify-start space-x-3">
                    <button
                      className="p-2 bg-[#4CBB17] text-white rounded-lg hover:bg-[#2E8B57] transition-colors"
                      aria-label="View Metadata"
                      onClick={() => onMetadataClick(file)}
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-[#FF4433] text-white rounded-lg hover:bg-[#D22B2B] transition-colors"
                      aria-label="Delete File"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#0F52BA] transition-colors"
                      aria-label="Download File"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}