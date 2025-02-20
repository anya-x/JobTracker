import { useState, useEffect } from "react";
import api from "../utils/api";

const DocumentUpload = ({ applicationId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [applicationId]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/application/${applicationId}`);
      setDocuments(response.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post(`/documents/upload/${applicationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this document?")) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        alert("Failed to delete document");
      }
    }
  };

  const handleDownload = (id) => {
    window.open(
      `${import.meta.env.VITE_API_URL}/documents/download/${id}`,
      "_blank"
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Documents</h3>

      {/* Upload Section */}
      <div className="flex items-center space-x-3">
        <input
          type="file"
          onChange={handleFileSelect}
          className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {doc.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(doc.fileSize)} • Uploaded{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No documents uploaded yet.</p>
      )}
    </div>
  );
};

export default DocumentUpload;
