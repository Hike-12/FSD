import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DJANGO_BASE_URL } from "@/lib/utils";
import { File, Upload, Trash2, Eye, Download, FileText } from "lucide-react";
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileManager = () => {
  const { teamId } = useParams();
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
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
      
      const contentType = response.headers.get("content-type");
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      
      window.open(fileURL, "_blank");
      toast.success("File opened in new tab");
    } catch (err) {
      console.error("Error viewing file:", err.message);
      toast.error("Error viewing file. Please try again.");
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
        toast.error("Failed to fetch files. Please try again later.");
      }
    };

    fetchFiles();
  }, [teamId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file || !fileName) {
      setUploadMessage("File and name are required");
      toast.error("File and name are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", fileName);

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
      setFileName("");
      toast.success("File uploaded successfully!");
    } catch (err) {
      console.error(err.message);
      setUploadMessage("Error uploading file");
      toast.error("Error uploading file. Please try again.");
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
      toast.success("File deleted successfully");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to delete file. Please try again.");
    }
  };

  // Helper function to format date nicely
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen p-6">
      <ToastContainer position="top-right" theme="dark" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
            File Manager
          </h1>
          <p className="text-blue-100/70 mt-2">
            Upload, view, and manage your team's files
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-blue-400" />
            Upload New File
          </h2>
          
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">File Name</label>
              <input
                type="text"
                value={fileName}
                readOnly
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-500/30 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-100/80 mb-1">Select File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-500/30 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                required
              />
            </div>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:shadow-blue-500/50 transition-all duration-300"
            >
              Upload File
            </motion.button>
          </form>
          
          {uploadMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200"
            >
              {uploadMessage}
            </motion.div>
          )}
        </motion.div>

        {/* Files List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-400" />
            Team Files
          </h2>
          
          {files.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-blue-100/70 text-center py-8"
            >
              No files uploaded yet
            </motion.p>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {files.map((file) => (
                <motion.div 
                  key={file.id}
                  variants={itemVariants}
                  className="bg-white/10 border border-blue-500/20 rounded-lg p-4 transition-all hover:bg-blue-900/20"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-white">{file.name}</h3>
                      <p className="text-sm text-blue-100/70">
                        Uploaded by: {file.uploaded_by || 'Team Member'} • {formatDate(file.uploaded_at || new Date())}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewFile(file.id)}
                        className="px-4 py-2 bg-indigo-600/60 text-white rounded-lg hover:bg-indigo-600/80 transition-colors flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteFile(file.id)}
                        className="px-4 py-2 bg-red-600/60 text-white rounded-lg hover:bg-red-600/80 transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FileManager;