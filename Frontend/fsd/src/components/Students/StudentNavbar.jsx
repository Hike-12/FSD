import React, { useState } from "react";
import { Menu, X, User, Search, Bell, LogOut, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";

const StudentNavbar = ({ children }) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
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

            <div className="flex items-center space-x-10">
              <nav className="hidden md:flex space-x-6 place-items-center">
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors flex items-center">
                  Find Students
                </a>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors flex items-center">
                  Mentors
                </a>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors flex items-center">
                  Competitions
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                {/* <button className="p-2 rounded-full text-[#A0AEC0] hover:text-white">
                  <Bell className="w-5 h-5" />
                </button> */}
                
                <div className="relative">
                  <button 
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    className="flex items-center text-[#A0AEC0] hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1F2A2A] flex items-center justify-center">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                  </button>
                </div>
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
                <a href="#" className="flex items-center py-2 px-4 text-white bg-[#121F1F] rounded-lg hover:bg-[#00C4B8]/10 transition-colors">
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </a>
                <a href="#" className="flex items-center py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">
                  <Users className="w-5 h-5 mr-3" />
                  My Teams
                </a>
                <a href="#" className="flex items-center py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">
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