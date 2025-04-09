import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import styled from "styled-components";
import StudentNavbar from "./StudentNavbar";
import StudentSidebar from "./StudentSidebar";

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

  return (
    <StudentNavbar>
      <div className="flex">
        <div className={`transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <StudentSidebar />
        </div>
        <main className="flex-1">
          {/* Page Content */}
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
                    Get Started
                  </PrimaryButton>
                  <SecondaryButton>
                    Learn More
                  </SecondaryButton>
                </div>
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
                Sign Up Now
              </PrimaryButton>
            </div>
          </section>
        </main>
      </div>
    </StudentNavbar>
  );
};

export default StudentLandingPage;