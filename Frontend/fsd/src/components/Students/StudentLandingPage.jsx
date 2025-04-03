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
  const [isOpen, setIsOpen] = useState(false);
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
  
  // Sample data
  const mentors = [
    { id: 1, name: "Dr. Sarah Miller", expertise: "Computer Science", image: "/webdev.jpeg", rating: 4.9 },
    { id: 2, name: "Prof. Michael Chen", expertise: "Data Science", image: "/api/placeholder/200/200", rating: 4.8 },
    { id: 3, name: "Dr. Jessica Rodriguez", expertise: "UI/UX Design", image: "/api/placeholder/200/200", rating: 4.7 }
  ];
  
  const competitions = [
    { id: 1, name: "Code Hackathon 2025", deadline: "April 15, 2025", participants: 205, image: "/api/placeholder/320/180" },
    { id: 2, name: "Data Analytics Challenge", deadline: "May 1, 2025", participants: 162, image: "/api/placeholder/320/180" },
    { id: 3, name: "Design Innovation Contest", deadline: "April 10, 2025", participants: 98, image: "/api/placeholder/320/180" }
  ];
  
  const students = [
    { id: 1, name: "Emma Wilson", course: "Computer Science", year: 2, interests: ["AI", "Web Dev"], image: "/api/placeholder/200/200" },
    { id: 2, name: "David Kim", course: "Data Science", year: 3, interests: ["Machine Learning", "Finance"], image: "/api/placeholder/200/200" },
    { id: 3, name: "Priya Sharma", course: "Graphic Design", year: 2, interests: ["UI/UX", "Animation"], image: "/api/placeholder/200/200" }
  ];
  
  // Data for HeroParallax component
  const products = [
    { title: "Web Development", thumbnail: "/webdev.jpeg", link: "#" },
    { title: "Mobile App Design", thumbnail: "/app.jpeg", link: "#" },
    { title: "Data Science", thumbnail: "/app.jpeg", link: "#" },
    { title: "Machine Learning", thumbnail: "/webdev.jpeg", link: "#" },
    { title: "Python Programming", thumbnail: "/app.jpeg", link: "#" },
    { title: "UI/UX Courses", thumbnail: "/webdev.jpeg", link: "#" }
  ];
  
  // Split student name into array of characters for color effect
  const nameCharacters = studentName.split('');

  // HeroParallax Component
  const HeroParallax = ({ products }) => {
    const firstRow = products.slice(0, 2);
    const secondRow = products.slice(2, 4);
    const thirdRow = products.slice(4, 6);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    });
    const springConfig = { stiffness: 300, damping: 30, bounce: 100 };
    const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 600]), springConfig);
    const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -600]), springConfig);
    const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig);
    const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig);
    const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [10, 0]), springConfig);
    const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-300, 100]), springConfig);
    
    return (
      <div
        ref={ref}
        className="h-[150vh] py-20 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]">
        <Header />
        <motion.div
          style={{
            rotateX,
            rotateZ,
            translateY,
            opacity,
          }}
          className="">
          <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
            {firstRow.map((product) => (
              <ProductCard product={product} translate={translateX} key={product.title} />
            ))}
          </motion.div>
          <motion.div className="flex flex-row mb-20 space-x-20">
            {secondRow.map((product) => (
              <ProductCard product={product} translate={translateXReverse} key={product.title} />
            ))}
          </motion.div>
          <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
            {thirdRow.map((product) => (
              <ProductCard product={product} translate={translateX} key={product.title} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  };

  const Header = () => {
    return (
      <h1 className="text-2xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent animate-pulse">
        Discover Your <br /> Learning Potential
      </h1>
    );
  };

  const ProductCard = ({ product, translate }) => {
    return (
      <motion.div
        style={{
          x: translate,
        }}
        whileHover={{
          y: -20,
        }}
        key={product.title}
        className="group/product h-96 w-[30rem] relative shrink-0">
        <a href={product.link} className="block group-hover/product:shadow-2xl">
          <img
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-left-top absolute h-full w-full inset-0 rounded-lg border border-gray-700"
            alt={product.title} />
        </a>
        <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none rounded-lg"></div>
        <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
          {product.title}
        </h2>
      </motion.div>
    );
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A', color: 'white' }}>
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50" style={{
        backgroundColor: '#121212',
        borderBottom: '1px solid #00C4B8',
        boxShadow: '0 0 15px rgba(0, 196, 184, 0.2)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-cyan-400 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 font-bold text-xl" style={{ color: '#00C4B8' }}>StudyHub</div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full text-gray-300 hover:text-amber-300 hover:bg-opacity-20 hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" style={{ color: '#A0AEC0' }} />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none sm:text-sm"
                  style={{
                    backgroundColor: '#1F2A2A',
                    border: '1px solid #2A3A3A',
                    color: 'white',
                    placeholder: '#A0AEC0'
                  }}
                  placeholder="Search..."
                  type="search"
                />
              </div>
              <button className="p-2 rounded-full text-gray-300 hover:text-cyan-400 hover:bg-gray-700">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2" style={{ color: '#00C4B8' }}>
                  <span className="sr-only">Open user menu</span>
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src="/api/placeholder/32/32" 
                    alt="Profile" 
                    style={{ border: '1px solid #00C4B8' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
  
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 shadow-lg w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 pt-16`}
        style={{
          backgroundColor: '#121212',
          borderRight: '1px solid #00C4B8'
        }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center px-4 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: '#1F2A2A',
                    color: '#00C4B8',
                    border: '1px solid #2A3A3A'
                  }}>
                  <span className="mr-3">🏠</span>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#mentors" className="flex items-center px-4 py-3 rounded-lg font-medium hover:text-cyan-400"
                  style={{
                    color: '#A0AEC0',
                    border: '1px solid transparent',
                    hover: {
                      backgroundColor: '#1F2A2A',
                      borderColor: '#00C4B8'
                    }
                  }}>
                  <span className="mr-3">👨‍🏫</span>
                  <span>Find Mentors</span>
                </a>
              </li>
              <li>
                <a href="#competitions" className="flex items-center px-4 py-3 rounded-lg font-medium hover:text-cyan-400"
                  style={{
                    color: '#A0AEC0',
                    border: '1px solid transparent'
                  }}>
                  <span className="mr-3">🏆</span>
                  <span>Find Competitions</span>
                </a>
              </li>
              <li>
                <a href="#students" className="flex items-center px-4 py-3 rounded-lg font-medium hover:text-cyan-400"
                  style={{
                    color: '#A0AEC0',
                    border: '1px solid transparent'
                  }}>
                  <span className="mr-3">👥</span>
                  <span>Find Students</span>
                </a>
              </li>
              <li>
                <a href="#more" className="flex items-center px-4 py-3 rounded-lg font-medium hover:text-cyan-400"
                  style={{
                    color: '#A0AEC0',
                    border: '1px solid transparent'
                  }}>
                  <span className="mr-3">📚</span>
                  <span>Learning Resources</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 rounded-lg font-medium hover:text-cyan-400"
                  style={{
                    color: '#A0AEC0',
                    border: '1px solid transparent'
                  }}>
                  <span className="mr-3">📝</span>
                  <span>My Courses</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 rounded-lg font-medium hover:text-cyan-400"
                  style={{
                    color: '#A0AEC0',
                    border: '1px solid transparent'
                  }}>
                  <span className="mr-3">⚙️</span>
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button onClick={handleLogout} className="flex items-center px-4 py-3 rounded-lg font-medium w-full"
              style={{
                color: '#ff6b6b',
                border: '1px solid transparent'
              }}>
              <LogOut className="mr-3 h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
  
      {/* Main Content */}
      <main className="pt-16 pb-12">
        {/* Hero Parallax Section */}
        <HeroParallax products={products} />
        
        {/* Welcome Section with Lamp Effect */}
        <section className="min-h-screen">
          <LampContainer>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                Welcome,{" "}
                <div className="inline-block">
                  {nameCharacters.map((char, index) => (
                    <span 
                      key={index} 
                      className={`inline-block ${index % colors.length === currentColorIndex ? colors[currentColorIndex] : "text-white"} transition-colors duration-500`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </h1>
              <p className="text-xl" style={{ color: '#A0AEC0', maxWidth: '42rem' }}>
                Your personalized learning platform. Connect with mentors, join competitions, and collaborate with peers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <PrimaryButton>
                  Explore Now <ChevronRight className="h-5 w-5" />
                </PrimaryButton>
                <SecondaryButton>
                  View My Dashboard
                </SecondaryButton>
              </div>
              
              {/* Moving Background Text */}
              <div className="mt-16 w-full overflow-hidden h-16 opacity-10">
                <div 
                  className="whitespace-nowrap text-7xl font-bold absolute"
                  style={{ 
                    color: '#00C4B8',
                    transform: `translateX(${scrollPosition}px)` 
                  }}
                >
                  LEARN CONNECT GROW ACHIEVE INNOVATE DISCOVER COLLABORATE EXCEL LEARN CONNECT GROW ACHIEVE INNOVATE DISCOVER COLLABORATE EXCEL
                </div>
              </div>
            </motion.div>
          </LampContainer>
        </section>
  
        {/* Find Mentors Section */}
        <section id="mentors" className="py-16 px-4 max-w-7xl mx-auto" style={{ backgroundColor: '#121212' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Find Mentors</h2>
            <SecondaryButton>
              View All <ChevronRight className="h-5 w-5" />
            </SecondaryButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id}>
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    className="w-20 h-20 rounded-full object-cover" 
                    style={{ border: '2px solid #00C4B8' }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white">{mentor.name}</h3>
                    <p style={{ color: '#00C4B8' }}>{mentor.expertise}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1" style={{ color: '#A0AEC0' }}>{mentor.rating}</span>
                    </div>
                  </div>
                </div>
                <p style={{ color: '#A0AEC0', marginBottom: '1rem' }}>
                  Expert in teaching complex concepts with practical, real-world applications.
                </p>
                <PrimaryButton className="mt-4">
                  Schedule Session
                </PrimaryButton>
              </Card>
            ))}
          </div>
        </section>
  
        {/* Find Competitions Section */}
        <section id="competitions" className="py-16 px-4 max-w-7xl mx-auto" style={{ backgroundColor: '#121212' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Find Competitions</h2>
            <SecondaryButton>
              View All <ChevronRight className="h-5 w-5" />
            </SecondaryButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id}>
                <div className="h-40 -m-6 mb-4">
                  <img 
                    src={competition.image} 
                    alt={competition.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-white">{competition.name}</h3>
                <div className="flex justify-between text-sm mb-4" style={{ color: '#A0AEC0' }}>
                  <span>Deadline: {competition.deadline}</span>
                  <span>{competition.participants} participants</span>
                </div>
                <p style={{ color: '#A0AEC0', marginBottom: '1rem' }}>
                  Showcase your skills, win prizes, and gain recognition in this exciting competition.
                </p>
                <PrimaryButton>
                  Register Now
                </PrimaryButton>
              </Card>
            ))}
          </div>
        </section>
  
        {/* Find Students Section */}
        <section id="students" className="py-16 px-4 max-w-7xl mx-auto" style={{ backgroundColor: '#121212' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Find Students for Group Projects</h2>
            <SecondaryButton>
              View All <ChevronRight className="h-5 w-5" />
            </SecondaryButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id}>
                <div className="flex items-center mb-4">
                  <img 
                    src={student.image} 
                    alt={student.name} 
                    className="w-16 h-16 rounded-full mr-4 object-cover" 
                    style={{ border: '2px solid #00C4B8' }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white">{student.name}</h3>
                    <p style={{ color: '#A0AEC0' }}>{student.course}, Year {student.year}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2" style={{ color: '#A0AEC0' }}>Interests:</div>
                  <div className="flex flex-wrap gap-2">
                    {student.interests.map((interest, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ 
                          backgroundColor: '#006D66',
                          color: '#A0AEC0'
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <SecondaryButton className="flex-1">
                    Message
                  </SecondaryButton>
                  <PrimaryButton className="flex-1">
                    Connect
                  </PrimaryButton>
                </div>
              </Card>
            ))}
          </div>
        </section>
  
        {/* More Section */}
        <section id="more" className="py-16 px-4 max-w-7xl mx-auto" style={{ 
          background: 'linear-gradient(to bottom, #121212, #0A0A0A)'
        }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Discover More</h2>
            <p className="text-xl" style={{ color: '#A0AEC0', maxWidth: '48rem', margin: '0 auto' }}>
              Everything you need for a successful academic journey in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-8">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-xl mb-2 text-white">Learning Resources</h3>
              <p style={{ color: '#A0AEC0' }}>Access a wide range of study materials, tutorials, and guides.</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-xl mb-2 text-white">Goal Tracking</h3>
              <p style={{ color: '#A0AEC0' }}>Set learning goals and track your progress over time.</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-bold text-xl mb-2 text-white">Event Calendar</h3>
              <p style={{ color: '#A0AEC0' }}>Stay updated with upcoming webinars, workshops, and deadlines.</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-bold text-xl mb-2 text-white">Community Forum</h3>
              <p style={{ color: '#A0AEC0' }}>Connect, share, and learn with fellow students.</p>
            </Card>
          </div>
        </section>
      </main>
  
      {/* Footer */}
      <footer className="py-12 px-4" style={{ 
        backgroundColor: '#121212',
        borderTop: '1px solid #00C4B8'
      }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#00C4B8' }}>StudyHub</h3>
            <p style={{ color: '#A0AEC0' }}>Your personal learning platform designed to help you connect, learn, and grow.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" style={{ color: '#A0AEC0', hover: { color: '#00C4B8' } }}>Home</a></li>
              <li><a href="#mentors" style={{ color: '#A0AEC0', hover: { color: '#00C4B8' } }}>Find Mentors</a></li>
              <li><a href="#competitions" style={{ color: '#A0AEC0', hover: { color: '#00C4B8' } }}>Find Competitions</a></li>
              <li><a href="#students" style={{ color: '#A0AEC0', hover: { color: '#00C4B8' } }}>Find Students</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <p style={{ color: '#A0AEC0' }}>Have questions? Reach out to our support team.</p>
            <PrimaryButton className="mt-4">
              Contact Support
            </PrimaryButton>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 text-center" style={{ 
          borderTop: '1px solid #2A3A3A',
          color: '#A0AEC0'
        }}>
          <p>© 2025 StudyHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentLandingPage;