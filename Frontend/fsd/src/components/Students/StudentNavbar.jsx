import React, { useState } from "react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#121F1F] to-[#001E1E]">
        {/* Top-left light effect */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(0,196,184,0.15)_0%,_rgba(0,196,184,0)_70%)] transform -translate-x-1/2 -translate-y-1/2"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#1F2A2A_1px,transparent_1px),linear-gradient(to_bottom,#1F2A2A_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* Collapsible Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="w-64 h-full bg-[#0A0A0A]/95 backdrop-blur-md border-r border-[#1F2A2A] shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-[#1F2A2A]">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-[#A0AEC0] hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <nav className="space-y-2">
              <a href="#" className="flex items-center py-2 px-4 text-white bg-[#121F1F] rounded-lg hover:bg-[#00C4B8]/10 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </a>
              <a href="#" className="flex items-center py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                My Team
              </a>
              <a href="#" className="flex items-center py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Competitions
              </a>
              <div className="pt-4 mt-4 border-t border-[#1F2A2A]">
                <h3 className="px-4 text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider">Quick Links</h3>
                <div className="mt-2 space-y-1">
                  <a href="#" className="block py-2 px-4 text-sm text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">Settings</a>
                  <a href="#" className="block py-2 px-4 text-sm text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">Help Center</a>
                  <a href="#" className="block py-2 px-4 text-sm text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">Sign Out</a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#1F2A2A]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-[#A0AEC0] hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C4B8] to-[#006D66]"></div>
                <span className="text-white font-bold">DevCompete</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="flex items-center text-[#A0AEC0] hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Students
              </a>
              <a href="#" className="flex items-center text-[#A0AEC0] hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Mentors
              </a>
              <a href="#" className="flex items-center text-[#A0AEC0] hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Competitions
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-[#A0AEC0] hover:text-white rounded-full hover:bg-[#1F2A2A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="relative">
                <button className="flex items-center space-x-1 text-[#A0AEC0] hover:text-white">
                  <div className="w-8 h-8 rounded-full bg-[#1F2A2A] flex items-center justify-center">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;