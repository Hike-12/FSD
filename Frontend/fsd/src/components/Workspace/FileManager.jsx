import React, { useEffect, useState } from "react";
import { DJANGO_BASE_URL } from "@/lib/utils";
import { useParams } from "react-router-dom";

const FileManager = () => {
  const { teamId } = useParams();
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(""); // Reintroduce fileName state
  const [uploadMessage, setUploadMessage] = useState("");

  const handleViewFile = async (fileId) => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/files/${fileId}/view/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch file for viewing");
      
      // Get content type from response
      const contentType = response.headers.get("content-type");
      
      // Handle the response based on content type
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error("Error viewing file:", err.message);
    }
  };
  
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/files/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch files");

        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchFiles();
  }, [teamId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : ""); // Automatically set file name
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file || !fileName) {
      setUploadMessage("File and name are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", fileName); // Include fileName in the form data

    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/files/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      const data = await response.json();
      setUploadMessage(data.message);
      setFiles((prev) => [...prev, { id: data.file_id, name: fileName, file_url: file.name }]);
      setFile(null);
      setFileName(""); // Reset fileName after upload
    } catch (err) {
      console.error(err.message);
      setUploadMessage("Error uploading file");
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/files/${fileId}/delete/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete file");

      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">File Manager</h2>

      {/* File Upload Form */}
      <form onSubmit={handleFileUpload} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">File Name</label>
          <input
            type="text"
            value={fileName}
            readOnly // Make the field non-editable
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange} // Use the new handleFileChange function
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Upload
        </button>
      </form>

      {uploadMessage && <p className="text-sm text-green-500">{uploadMessage}</p>}

      {/* File List */}
      <ul className="space-y-4">
  {files.map((file) => (
    <li key={file.id} className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">{file.name}</h3>
          <p className="text-sm text-gray-500">
            Uploaded by: {file.uploaded_by} on {new Date(file.uploaded_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {/* View Button */}
          {/* View Button */}
            <button
            onClick={() => handleViewFile(file.id)} // Call the function to fetch and view the file
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
            View
            </button>

          {/* Download Button */}
          <a
            href={`${DJANGO_BASE_URL}${file.file_url}`} // Ensure the full URL is used
            download={file.name} // Add download attribute
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Download
          </a>

          {/* Delete Button */}
          <button
            onClick={() => handleDeleteFile(file.id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  ))}
</ul>
    </div>
  );
};

export default FileManager;