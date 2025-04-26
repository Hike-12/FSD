import React, { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, Trophy, User, PlusCircle, Home, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const HostNavbar = ({ children }) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const mainRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;
    
    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const navItems = [
    { path: "students", icon: Users, label: "Students" },
    { path: "mentors", icon: User, label: "Mentors" },
    { path: "competitions", icon: Trophy, label: "Competitions" },
  ];

  
  const rightSidebarItems = [
    { path: "competition-create", icon: PlusCircle, label: "Create Competition" },
    { path: "admin-competitions", icon: Home, label: "Competition" },
  ];

  const rightSidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const mobileMenuVariants = {
    open: { 
      height: "auto",
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    },
    closed: { 
      height: 0,
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        when: "afterChildren"
      } 
    },
  };

  const navbarVariants = {
    visible: { y: 0 },
    hidden: { y: '-100%' }
  };

  const itemVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: -20 }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#050A15] text-[#f8fafc]">
      {/* Top Navigation Bar */}
      <motion.header 
        className={`bg-[#050A15]/90 backdrop-blur-md border-b border-[#1F2A2A] w-full z-10 fixed top-0 ${rightSidebarOpen ? 'md:pr-64' : ''}`}
        initial="visible"
        animate={visible ? "visible" : "hidden"}
        variants={navbarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Mobile menu button and logo */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-[#94a3b8] hover:text-white mr-4"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logo */}
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                HostHub
              </Link>
            </div>

            {/* Center - Desktop Navigation */}
            <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={`/${item.path}`}
                  className="text-[#94a3b8] hover:text-white flex items-center space-x-2 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side - User profile */}
            <div className="flex items-center">
              <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'H'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
            >
              <motion.div className="px-4 py-2 space-y-3">
                {navItems.map((item) => (
                  <motion.div key={item.path} variants={itemVariants}>
                    <Link
                      to={`/${item.path}`}
                      className="block py-2 px-4 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#3b82f6]/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

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
                  <h2 className="text-xl font-bold text-white">Host Dashboard</h2>
                  <button
                    onClick={() => setRightSidebarOpen(false)}
                    className="text-[#94a3b8] hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div 
                  className="p-4 border-b border-[#1F2A2A] cursor-pointer hover:bg-[#1F2A2A]/50 transition-colors"
                  onClick={() => {
                    navigate('/admin-profile');
                    setRightSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'H'}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{user?.name || 'Host'}</h3>
                      <p className="text-sm text-[#94a3b8]">{user?.email || 'host@example.com'}</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 p-4 space-y-3">
                  {rightSidebarItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={`/${item.path}`}
                        className="flex items-center py-2 px-4 rounded-lg transition-colors text-[#94a3b8] hover:text-white hover:bg-[#3b82f6]/10"
                        onClick={() => setRightSidebarOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="p-4 border-t border-[#1F2A2A]">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center w-full py-2 px-4 text-[#94a3b8] hover:text-white hover:bg-[#3b82f6]/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main 
        ref={mainRef}
        className={`flex-1 overflow-y-auto pt-16 md:pt-20 p-4 md:p-6 transition-all duration-300 ${rightSidebarOpen ? 'md:mr-64' : ''}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default HostNavbar;