import React, { useState } from "react";
import { Menu, X, User, Search, Bell, LogOut, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const StudentNavbar = ({ children }) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false); // Changed to false initially
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#121F1F] to-[#001E1E]">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(0,196,184,0.15)_0%,_rgba(0,196,184,0)_70%)] transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#1F2A2A_1px,transparent_1px),linear-gradient(to_bottom,#1F2A2A_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* Left Sidebar */}
      <div 
        className={`relative z-20 h-full bg-[#0A0A0A]/90 backdrop-blur-md border-r border-[#1F2A2A] transition-all duration-300 ease-in-out ${
          leftSidebarOpen ? "w-64" : "w-0 opacity-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1F2A2A]">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C4B8] to-[#006D66]"></div>
              <span className="text-white font-bold">lmao</span>
            </div>
            
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="text-[#A0AEC0] hover:text-white p-1 rounded-md"
            >
              <ChevronLeft />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/students"
              className="flex items-center p-3 rounded-lg hover:bg-[#00C4B8]/10 transition-colors justify-start"
            >
              <Users className="w-5 h-5 text-[#A0AEC0]" />
              <span className="ml-3 text-[#A0AEC0] hover:text-white">Find Students</span>
            </Link>
            
            <Link
              to="/mentors"
              className="flex items-center p-3 rounded-lg hover:bg-[#00C4B8]/10 transition-colors justify-start"
            >
              <User className="w-5 h-5 text-[#A0AEC0]" />
              <span className="ml-3 text-[#A0AEC0] hover:text-white">Find Mentors</span>
            </Link>
            
            <Link
              to="/competitions"
              className="flex items-center p-3 rounded-lg hover:bg-[#00C4B8]/10 transition-colors justify-start"
            >
              <Trophy className="w-5 h-5 text-[#A0AEC0]" />
              <span className="ml-3 text-[#A0AEC0] hover:text-white">Find Competitions</span>
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#1F2A2A]">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-[#00C4B8]/10 transition-colors justify-start"
            >
              <LogOut className="w-5 h-5 text-[#A0AEC0]" />
              <span className="ml-3 text-[#A0AEC0] hover:text-white">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#1F2A2A]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C4B8] to-[#006D66]"></div>
                <span className="text-white font-bold">DevCompete</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  className="flex items-center text-[#A0AEC0] hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1F2A2A] flex items-center justify-center">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Right Sidebar */}
        <div className={`fixed inset-y-0 right-0 z-30 transform ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="w-64 h-full bg-[#0A0A0A]/95 backdrop-blur-md border-l border-[#1F2A2A] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1F2A2A]">
              <h2 className="text-xl font-bold text-white">My Account</h2>
              <button 
                onClick={() => setRightSidebarOpen(false)}
                className="text-[#A0AEC0] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <nav className="space-y-2">
                <a href="/student-profile" className="flex items-center py-2 px-4 text-white bg-[#121F1F] rounded-lg hover:bg-[#00C4B8]/10 transition-colors">
                  <User className="w-5 h-5 mr-3" />
                  Gian
                </a>
                <a href="/teams" className="flex items-center py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">
                  <Users className="w-5 h-5 mr-3" />
                  My Teams
                </a>
                <a href="/competitions" className="flex items-center py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">
                  <Trophy className="w-5 h-5 mr-3" />
                  My Competitions
                </a>
                <button 
                  onClick={handleLogout}
                  className="flex items-center py-2 px-4 w-full text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentNavbar;