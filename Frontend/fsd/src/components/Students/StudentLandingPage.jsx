import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, User, Search, Bell, LogOut, Moon, Sun } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import styled, { keyframes } from 'styled-components';

// LampContainer component with login page color theme
const LampContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden w-full rounded-md z-0 ${className}`}
      style={{
        background: '#121212',
        border: '1px solid #00C4B8',
        boxShadow: '0 0 30px rgba(0, 196, 184, 0.2)'
      }}>
      <div
        className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]">
          <div
            className="absolute w-[100%] left-0 bg-gray-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div
            className="absolute w-40 h-[100%] left-0 bg-gray-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 text-white [--conic-position:from_290deg_at_center_top]">
          <div
            className="absolute w-40 h-[100%] right-0 bg-gray-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div
            className="absolute w-[100%] right-0 bg-gray-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div
          className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-gray-950 blur-2xl"></div>
        <div
          className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div
          className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400 "></motion.div>

        <div
          className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-gray-950 "></div>
      </div>
      <div className="relative z-50 flex -translate-y-52 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};

// Styled components with login page color theme
const Card = styled.div`
  background: #1F2A2A;
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #2A3A3A;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: #00C4B8;
    box-shadow: 0 0 15px rgba(0, 196, 184, 0.2);
  }
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #00C4B8, #006D66);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 196, 184, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 196, 184, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #1F2A2A;
  color: #A0AEC0;
  border: 1px solid #2A3A3A;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #2A3A3A;
    color: white;
    border-color: #00C4B8;
  }
`;

const StudentLandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Reniyas Nadar");
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Color theme matching login page
  const colors = [
    "text-cyan-400", "text-fuchsia-400", "text-pink-400", 
    "text-amber-400", "text-emerald-400", "text-indigo-400", 
    "text-violet-400", "text-rose-400", "text-blue-400"
  ];
  
  // Change color every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Scroll effect for moving background text
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Animation for moving text
    const animateText = () => {
      setScrollPosition((prev) => (prev - 1) % 2000);
      requestAnimationFrame(animateText);
    };
    
    const animation = requestAnimationFrame(animateText);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animation);
    };
  }, []);
  
  // Split student name into array of characters for color effect
  const nameCharacters = studentName.split('');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
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
              <X className="w-6 h-6" />
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
                  <button 
                    onClick={handleLogout}
                    className="block py-2 px-4 text-sm text-[#A0AEC0] hover:text-white hover:bg-[#00C4B8]/10 rounded-lg transition-colors w-full text-left"
                  >
                    Sign Out
                  </button>
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
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C4B8] to-[#006D66]"></div>
                <span className="text-white font-bold">DevCompete</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full text-gray-300 hover:text-amber-300 hover:bg-opacity-20 hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2 rounded-full text-[#A0AEC0] hover:text-white">
                <Bell className="w-5 h-5" />
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
          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/90 to-[#121F1F]/90"></div>
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500 filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-500 filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full bg-emerald-500 filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
              </div>
            </div>
            
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                  Welcome to <span className="block mt-2">DevCompete</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
                  The ultimate platform for students to learn, compete, and grow through coding challenges and collaborative projects.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <PrimaryButton>
                    Get Started <ChevronRight className="h-5 w-5" />
                  </PrimaryButton>
                  <SecondaryButton>
                    Learn More
                  </SecondaryButton>
                </div>
              </motion.div>
            </div>
            
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-10">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronRight className="h-8 w-8 text-gray-400 transform rotate-90" />
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose DevCompete?</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Our platform offers unique features designed to enhance your learning experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <div className="text-5xl mb-6">💻</div>
                <h3 className="font-bold text-2xl mb-4 text-white">Real-world Challenges</h3>
                <p className="text-gray-400">
                  Solve problems that mimic real industry scenarios to prepare for your future career.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="text-5xl mb-6">🏆</div>
                <h3 className="font-bold text-2xl mb-4 text-white">Competitive Learning</h3>
                <p className="text-gray-400">
                  Participate in coding competitions and climb the leaderboard to showcase your skills.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="text-5xl mb-6">👥</div>
                <h3 className="font-bold text-2xl mb-4 text-white">Collaborative Projects</h3>
                <p className="text-gray-400">
                  Work with peers on projects that simulate real team environments and workflows.
                </p>
              </Card>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-4 bg-gradient-to-br from-[#121212] to-[#0A0A0A]">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">10K+</div>
                  <div className="text-gray-400">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">500+</div>
                  <div className="text-gray-400">Challenges</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">50+</div>
                  <div className="text-gray-400">Competitions</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">100+</div>
                  <div className="text-gray-400">Projects</div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Students Say</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Hear from students who have transformed their learning experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-white">Alex Johnson</h4>
                    <p className="text-sm text-gray-400">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "DevCompete helped me land my dream internship by preparing me with real-world coding challenges."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </Card>
              
              <Card className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-white">Maria Garcia</h4>
                    <p className="text-sm text-gray-400">Data Science Student</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "The collaborative projects gave me the team experience I needed to feel confident in job interviews."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </Card>
              
              <Card className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-white">James Wilson</h4>
                    <p className="text-sm text-gray-400">Web Development Student</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "The competitive aspect pushed me to learn faster than I ever thought possible."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-gradient-to-r from-[#006D66] to-[#00C4B8]">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
              <p className="text-xl text-white mb-8">
                Join thousands of students who are accelerating their careers with DevCompete.
              </p>
              <PrimaryButton className="bg-white text-[#006D66] hover:bg-gray-100 mx-auto">
                Sign Up Now <ChevronRight className="h-5 w-5" />
              </PrimaryButton>
            </div>
          </section>
        </main>

        {/* Footer */}
        {/* <footer className="py-12 px-4 border-t border-[#1F2A2A]" style={{ backgroundColor: '#0A0A0A' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">DevCompete</h3>
                <p className="text-sm" style={{ color: '#A0AEC0' }}>
                  Empowering students through collaboration, competition, and mentorship.
                </p>
              </div>
              <div>
                <h4 className="text-md font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Home</a></li>
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>About</a></li>
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Features</a></li>
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold text-white mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Help Center</a></li>
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Contact Us</a></li>
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Privacy Policy</a></li>
                  <li><a href="#" className="text-sm hover:text-[#00C4B8]" style={{ color: '#A0AEC0' }}>Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold text-white mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-[#A0AEC0] hover:text-[#00C4B8]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-[#A0AEC0] hover:text-[#00C4B8]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                <a href="#" className="text-[#A0AEC0] hover:text-[#00C4B8]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748 1.15.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-[#A0AEC0] hover:text-[#00C4B8]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
              <div className="mt-4">
                <p className="text-sm" style={{ color: '#A0AEC0' }}>Subscribe to our newsletter</p>
                <div className="flex mt-2">
                  <input type="email" placeholder="Your email" className="px-3 py-2 bg-[#1F2A2A] border border-[#2A3A3A] rounded-l-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00C4B8] w-full" />
                  <button className="px-4 py-2 bg-[#00C4B8] text-white rounded-r-md text-sm font-medium hover:bg-[#009688] transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#1F2A2A] text-center">
            <p className="text-sm" style={{ color: '#A0AEC0' }}>
              © {new Date().getFullYear()} DevCompete. All rights reserved.
            </p>
          </div>
        </div>
      </footer> */}
        </div>
    </div>
  );
};

export default StudentLandingPage;