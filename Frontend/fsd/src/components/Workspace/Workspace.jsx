import React, { useState } from "react";
import Chat from "./Chat";
import TaskManager from "./TaskManager";
import FileManager from "./FileManager";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, CheckSquare, FileText, Menu, X } from "lucide-react";

const Workspace = () => {
  const teamId = useParams().teamId;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGoBack = () => {
    navigate(`/team/${teamId}`);
  };

  const tabs = [
    { id: "chat", label: "Team Chat", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "tasks", label: "Task Manager", icon: <CheckSquare className="w-5 h-5" /> },
    { id: "files", label: "File Manager", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="py-4 px-6 bg-[#030718]/90 backdrop-blur-lg border-b border-blue-500/20 shadow-xl"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
              Team Workspace
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-500/30 text-blue-100"
                    : "bg-transparent text-blue-300/70 hover:bg-blue-500/10"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Mobile Navigation (slide down when open) */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? "auto" : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden bg-[#030718]/90 border-b border-blue-500/20"
      >
        <nav className="flex flex-col p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500/30 text-blue-100"
                  : "bg-transparent text-blue-300/70"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {activeTab === "chat" && <Chat />}
          {activeTab === "tasks" && <TaskManager />}
          {activeTab === "files" && <FileManager />}
        </motion.div>
      </main>
    </div>
  );
};

export default Workspace;