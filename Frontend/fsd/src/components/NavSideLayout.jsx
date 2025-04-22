import React, { useState, useEffect } from "react";
import { Menu, X, User, Search, Bell, LogOut, Users, Trophy, ChevronLeft, ChevronRight, Home, Bookmark, Settings, MessageSquare, Award } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const StudentNavbar = ({ children }) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setLeftSidebarOpen(true);
      } else {
        setLeftSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setActiveTab(location.pathname.split('/')[1] || 'dashboard');
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: "students", icon: Users, label: "Find Students" },
    { path: "mentors", icon: User, label: "Find Mentors" },
    { path: "competitions", icon: Trophy, label: "Find Competitions" },
    { path: "messages", icon: MessageSquare, label: "Messages" },
    { path: "bookmarks", icon: Bookmark, label: "Bookmarks" },
  ];

  const userMenuItems = [
    { path: "profile", icon: User, label: "My Profile" },
    { path: "teams", icon: Users, label: "My Teams" },
    { path: "achievements", icon: Award, label: "Achievements" },
    { path: "settings", icon: Settings, label: "Settings" },
  ];

  const sidebarVariants = {
    open: { 
      width: "16rem",
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      width: "0rem",
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: 0.1
      }
    }
  };

  const contentVariants = {
    open: { 
      marginLeft: "16rem",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: 0.1
      }
    },
    closed: { 
      marginLeft: "0rem",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const rightSidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      x: "100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#050A15] text-[#f8fafc]">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#3b82f6]/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100],
              x: [0, (Math.random() - 0.5) * 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Left Sidebar */}
      <AnimatePresence>
        {(leftSidebarOpen || !isMobile) && (
          <motion.div
            className={`relative z-20 h-full bg-[#050A15]/90 backdrop-blur-md border-r border-[#1F2A2A] overflow-hidden shadow-2xl`}
            initial="closed"
            animate={leftSidebarOpen ? "open" : "closed"}
            variants={sidebarVariants}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1F2A2A]">
                <motion.div 
                  className="flex items-center space-x-2"
                  variants={itemVariants}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] flex items-center justify-center">
                    <span className="text-xs font-bold">DC</span>
                  </div>
                  <span className="text-white font-bold">DevCompete</span>
                </motion.div>
                
                {isMobile && (
                  <motion.button
                    onClick={() => setLeftSidebarOpen(false)}
                    className="text-[#94a3b8] hover:text-white p-1 rounded-md"
                    variants={itemVariants}
                  >
                    <ChevronLeft />
                  </motion.button>
                )}
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/${item.path}`}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.path
                          ? "bg-[#3b82f6]/20 text-white border-l-4 border-[#3b82f6]"
                          : "text-[#94a3b8] hover:bg-[#3b82f6]/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="ml-3">{item.label}</span>
                      {activeTab === item.path && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute right-0 w-1 h-6 bg-[#3b82f6] rounded-l-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-[#1F2A2A]">
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 rounded-lg hover:bg-[#3b82f6]/10 transition-colors text-[#94a3b8] hover:text-white"
                  variants={itemVariants}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="ml-3">Sign Out</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        className="relative z-10 flex-1 flex flex-col overflow-hidden"
        animate={leftSidebarOpen && !isMobile ? "open" : "closed"}
        variants={contentVariants}
      >
        {/* Top Navigation Bar */}
        <header className="bg-[#050A15]/90 backdrop-blur-md border-b border-[#1F2A2A]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button 
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  className="text-[#94a3b8] hover:text-white p-2 rounded-md"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 bg-[#0A1428] border border-[#1F2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-white placeholder-[#94a3b8]"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-[#94a3b8]" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-[#94a3b8] hover:text-white p-2 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button 
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="flex items-center text-[#94a3b8] hover:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                {!isMobile && (
                  <span className="ml-2">{user?.name || 'User'}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Right Sidebar */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRightSidebarOpen(false)}
              />
              
              <motion.div
                className="fixed inset-y-0 right-0 z-30 w-64 bg-[#050A15]/95 backdrop-blur-md border-l border-[#1F2A2A] shadow-xl overflow-y-auto"
                initial="closed"
                animate="open"
                exit="closed"
                variants={rightSidebarVariants}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-[#1F2A2A]">
                    <h2 className="text-xl font-bold text-white">My Account</h2>
                    <button 
                      onClick={() => setRightSidebarOpen(false)}
                      className="text-[#94a3b8] hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-4 border-b border-[#1F2A2A]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] flex items-center justify-center">
                        <span className="text-lg font-medium">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{user?.name || 'User'}</h3>
                        <p className="text-sm text-[#94a3b8]">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-4 space-y-2">
                    {userMenuItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={`/${item.path}`}
                          className={`flex items-center py-2 px-4 rounded-lg transition-colors ${
                            activeTab === item.path
                              ? "bg-[#3b82f6]/20 text-white"
                              : "text-[#94a3b8] hover:bg-[#3b82f6]/10 hover:text-white"
                          }`}
                          onClick={() => setRightSidebarOpen(false)}
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                  
                  <div className="p-4 border-t border-[#1F2A2A]">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full py-2 px-4 text-[#94a3b8] hover:text-white hover:bg-[#3b82f6]/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
};

export default StudentNavbar;