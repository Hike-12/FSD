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
              <a href="#" className="block py-2 px-4 text-white bg-[#121F1F] rounded-lg hover:bg-[#00C4B8]/10 transition-colors">Home</a>
              <a href="#" className="block py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">About</a>
              <a href="#" className="block py-2 px-4 text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors">Contact</a>
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
            <nav className="flex space-x-6">
              <a href="#" className="text-[#A0AEC0] hover:text-white">Help</a>
              <a href="#" className="text-[#A0AEC0] hover:text-white">Docs</a>
            </nav>
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