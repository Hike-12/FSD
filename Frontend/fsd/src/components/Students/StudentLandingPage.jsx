import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, User, Search, Bell, LogOut, Moon, Sun } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from "motion/react";

// Modified LampContainer component from paste-2.txt
const LampContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden w-full rounded-md z-0 ${className}`}>
      <div
        className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
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

const StudentLandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [studentName, setStudentName] = useState("Reniyas Nadar");
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [darkMode, setDarkMode] = useState(true); // Start with dark mode enabled
  
  // Bright, radiant colors for the multicolor effect
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
  
  // Card component for reuse
  const Card = ({ children, className }) => (
    <div className={`bg-gray-800 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
  
  // Button component for reuse
  const Button = ({ children, className, primary = false }) => (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
      ${primary 
        ? 'bg-blue-500 text-white hover:bg-blue-600'
        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'} 
      ${className}`}
    >
      {children}
    </button>
  );

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
      <h1 className="text-2xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-400 bg-clip-text text-transparent animate-pulse">
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
            className="object-cover object-left-top absolute h-full w-full inset-0 rounded-lg"
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
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-blue-400 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 font-bold text-xl text-blue-400">StudyHub</div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full text-gray-300 hover:text-yellow-300 hover:bg-opacity-20 hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                />
              </div>
              <button className="p-2 rounded-full text-gray-300 hover:text-blue-400 hover:bg-gray-700">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">Open user menu</span>
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src="/api/placeholder/32/32" 
                    alt="Profile" 
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
  
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-gray-800 text-white shadow-lg w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 pt-16`}>
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
                <a href="#" className="flex items-center px-4 py-3 bg-gray-700 text-white rounded-lg font-medium">
                  <span className="mr-3">🏠</span>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#mentors" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <span className="mr-3">👨‍🏫</span>
                  <span>Find Mentors</span>
                </a>
              </li>
              <li>
                <a href="#competitions" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <span className="mr-3">🏆</span>
                  <span>Find Competitions</span>
                </a>
              </li>
              <li>
                <a href="#students" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <span className="mr-3">👥</span>
                  <span>Find Students</span>
                </a>
              </li>
              <li>
                <a href="#more" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <span className="mr-3">📚</span>
                  <span>Learning Resources</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <span className="mr-3">📝</span>
                  <span>My Courses</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <span className="mr-3">⚙️</span>
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <a href="#" className="flex items-center px-4 py-3 text-red-500 hover:bg-gray-700 rounded-lg font-medium">
              <LogOut className="mr-3 h-5 w-5" />
              <span>Log Out</span>
            </a>
          </div>
        </div>
      </aside>
  
      {/* Main Content */}
      <main className="pt-16 pb-12">
        {/* Hero Parallax Section */}
        <HeroParallax products={products} />
        
        {/* Welcome Section with Lamp Effect */}
        <section className="min-h-screen">
          <LampContainer className="bg-gray-950">
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
              <p className="text-xl text-gray-300 max-w-2xl mb-8">
                Your personalized learning platform. Connect with mentors, join competitions, and collaborate with peers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button primary className="text-lg px-6 py-3">
                  Explore Now <ChevronRight className="h-5 w-5" />
                </Button>
                <Button className="text-lg px-6 py-3">
                  View My Dashboard
                </Button>
              </div>
              
              {/* Moving Background Text */}
              <div className="mt-16 w-full overflow-hidden h-16 opacity-10">
                <div 
                  className="whitespace-nowrap text-7xl font-bold text-blue-300 absolute"
                  style={{ transform: `translateX(${scrollPosition}px)` }}
                >
                  LEARN CONNECT GROW ACHIEVE INNOVATE DISCOVER COLLABORATE EXCEL LEARN CONNECT GROW ACHIEVE INNOVATE DISCOVER COLLABORATE EXCEL
                </div>
              </div>
            </motion.div>
          </LampContainer>
        </section>
  
        {/* Find Mentors Section */}
        <section id="mentors" className="py-16 px-4 max-w-7xl mx-auto bg-gray-900">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Find Mentors</h2>
            <Button>
              View All <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    className="w-20 h-20 rounded-full object-cover" 
                  />
                  <div>
                    <h3 className="font-bold text-lg">{mentor.name}</h3>
                    <p className="text-blue-400">{mentor.expertise}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-gray-300">{mentor.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">Expert in teaching complex concepts with practical, real-world applications.</p>
                <Button className="mt-auto self-start">Schedule Session</Button>
              </Card>
            ))}
          </div>
        </section>
  
        {/* Find Competitions Section */}
        <section id="competitions" className="py-16 px-4 max-w-7xl mx-auto bg-gray-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Find Competitions</h2>
            <Button>
              View All <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="overflow-hidden">
                <div className="h-40 -m-6 mb-4">
                  <img 
                    src={competition.image} 
                    alt={competition.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-bold text-xl mb-2">{competition.name}</h3>
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>Deadline: {competition.deadline}</span>
                  <span>{competition.participants} participants</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Showcase your skills, win prizes, and gain recognition in this exciting competition.
                </p>
                <Button primary>Register Now</Button>
              </Card>
            ))}
          </div>
        </section>
  
        {/* Find Students Section */}
        <section id="students" className="py-16 px-4 max-w-7xl mx-auto bg-gray-900">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Find Students for Group Projects</h2>
            <Button>
              View All <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id}>
                <div className="flex items-center mb-4">
                  <img 
                    src={student.image} 
                    alt={student.name} 
                    className="w-16 h-16 rounded-full mr-4 object-cover" 
                  />
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-gray-400">{student.course}, Year {student.year}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Interests:</div>
                  <div className="flex flex-wrap gap-2">
                    {student.interests.map((interest, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Message</Button>
                  <Button primary className="flex-1">Connect</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
  
  
        {/* More Section */}
        <section id="more" className={`py-16 px-4 max-w-7xl mx-auto ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'}`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Discover More</h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Everything you need for a successful academic journey in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={`text-center p-8 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-xl mb-2">Learning Resources</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Access a wide range of study materials, tutorials, and guides.</p>
            </Card>
            
            <Card className={`text-center p-8 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-xl mb-2">Goal Tracking</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Set learning goals and track your progress over time.</p>
            </Card>
            
            <Card className={`text-center p-8 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-bold text-xl mb-2">Event Calendar</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stay updated with upcoming webinars, workshops, and deadlines.</p>
            </Card>
            
            <Card className={`text-center p-8 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-bold text-xl mb-2">Community Forum</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connect, share, and learn with fellow students.</p>
            </Card>
          </div>
        </section>
      </main>
  
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">StudyHub</h3>
            <p className="text-gray-300">Your personal learning platform designed to help you connect, learn, and grow.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
              <li><a href="#mentors" className="text-gray-300 hover:text-white">Find Mentors</a></li>
              <li><a href="#competitions" className="text-gray-300 hover:text-white">Find Competitions</a></li>
              <li><a href="#students" className="text-gray-300 hover:text-white">Find Students</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">Have questions? Reach out to our support team.</p>
            <button className="mt-4 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© 2025 StudyHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentLandingPage;