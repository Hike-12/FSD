"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {DJANGO_BASE_URL} from "@/lib/utils";

// TypewriterEffectSmooth Component
const TypewriterEffectSmooth = ({ words, className }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const typeSpeed = 150;
    const deleteSpeed = 100;
    const waitBetweenWords = 1500;
    
    const handleTyping = () => {
      const word = words[currentWordIndex].text;
      
      if (!isDeleting) {
        // Typing
        setCurrentWord(word.substring(0, currentWord.length + 1));
        
        // If word is complete
        if (currentWord.length === word.length) {
          // Wait and then start deleting
          setTimeout(() => setIsDeleting(true), waitBetweenWords);
          return;
        }
      } else {
        // Deleting
        setCurrentWord(word.substring(0, currentWord.length - 1));
        
        // If word is deleted
        if (currentWord.length === 0) {
          setIsDeleting(false);
          setCurrentWordIndex((currentWordIndex + 1) % words.length);
          return;
        }
      }
    };
    
    const typingInterval = setTimeout(
      handleTyping,
      isDeleting ? deleteSpeed : typeSpeed
    );
    
    return () => clearTimeout(typingInterval);
  }, [currentWord, currentWordIndex, isDeleting, words]);
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center">
        <span className="inline-block min-w-0">
          {words.map((word, index) => {
            if (index === currentWordIndex) {
              return (
                <span 
                  key={index}
                  className={cn("inline-block transition-all duration-200", word.className)}
                >
                  {currentWord}
                  <span className="animate-blink">|</span>
                </span>
              );
            }
            return null;
          })}
        </span>
      </h1>
    </div>
  );
};

// Navbar Component
// const Navbar = ({ toggleSidebar }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#1F2A2A] py-4 px-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C4B8] to-[#006D66]"></div>
//           <span className="text-white font-bold text-xl">DevCompete</span>
//         </div>
        
//         <div className="hidden md:flex items-center space-x-8">
//           <Link to="/" className="text-[#A0AEC0] hover:text-white transition-colors">Home</Link>
//           <Link to="/competitions" className="text-white font-medium border-b-2 border-[#00C4B8] pb-1">Competitions</Link>
//           <Link to="/leaderboard" className="text-[#A0AEC0] hover:text-white transition-colors">Leaderboard</Link>
//           <Link to="/resources" className="text-[#A0AEC0] hover:text-white transition-colors">Resources</Link>
//         </div>
        
//         <div className="hidden md:flex items-center space-x-4">
//           <button 
//             onClick={toggleSidebar} 
//             className="p-2 text-[#A0AEC0] hover:text-white transition-colors"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
//             </svg>
//           </button>
//           <button onClick={() => navigate('/profile')} className="p-2 text-[#A0AEC0] hover:text-white transition-colors">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//             </svg>
//           </button>
//           <button onClick={() => navigate('/notifications')} className="p-2 text-[#A0AEC0] hover:text-white transition-colors">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
//             </svg>
//           </button>
//         </div>
        
//         <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#A0AEC0] hover:text-white">
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             {isMenuOpen ? (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//             ) : (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
//             )}
//           </svg>
//         </button>
//       </div>
      
//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className="md:hidden absolute top-16 left-0 right-0 bg-[#121F1F] py-4 px-6 border-b border-[#1F2A2A]">
//           <div className="flex flex-col space-y-4">
//             <Link to="/" className="text-[#A0AEC0] hover:text-white transition-colors">Home</Link>
//             <Link to="/competitions" className="text-white font-medium border-l-2 border-[#00C4B8] pl-2">Competitions</Link>
//             <Link to="/leaderboard" className="text-[#A0AEC0] hover:text-white transition-colors">Leaderboard</Link>
//             <Link to="/resources" className="text-[#A0AEC0] hover:text-white transition-colors">Resources</Link>
//             <div className="flex space-x-4 pt-2 border-t border-[#1F2A2A]">
//               <button onClick={() => navigate('/profile')} className="text-[#A0AEC0] hover:text-white transition-colors flex items-center">
//                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                 </svg>
//                 Profile
//               </button>
//               <button onClick={() => navigate('/notifications')} className="text-[#A0AEC0] hover:text-white transition-colors flex items-center">
//                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
//                 </svg>
//                 Notifications
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// // Sidebar Component
// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const sidebarCategories = [
//     { name: "All Competitions", icon: "🏆", count: 42 },
//     { name: "Web Development", icon: "🌐", count: 15 },
//     { name: "Mobile Apps", icon: "📱", count: 8 },
//     { name: "Data Science", icon: "📊", count: 12 },
//     { name: "AI & ML", icon: "🤖", count: 7 },
//     { name: "Blockchain", icon: "⛓️", count: 5 },
//     { name: "Game Dev", icon: "🎮", count: 6 },
//     { name: "UI/UX Design", icon: "🎨", count: 9 },
//   ];

//   return (
//     <>
//       {/* Mobile Sidebar Backdrop */}
//       {isOpen && (
//         <div 
//           className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
//           onClick={toggleSidebar}
//         ></div>
//       )}
      
//       {/* Sidebar */}
//       <aside 
//         className={`fixed top-16 bottom-0 left-0 w-64 bg-[#0A0A0A]/95 backdrop-blur-lg border-r border-[#1F2A2A] z-40 transform transition-transform duration-300 ease-in-out ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           <div className="p-5 border-b border-[#1F2A2A]">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search competitions..."
//                 className="w-full bg-[#121F1F] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B8] placeholder-[#A0AEC0]"
//               />
//               <svg
//                 className="w-5 h-5 text-[#A0AEC0] absolute right-3 top-2.5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 ></path>
//               </svg>
//             </div>
//           </div>
          
//           <div className="overflow-y-auto flex-grow py-4">
//             <h3 className="px-5 text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider mb-3">
//               Categories
//             </h3>
//             <ul>
//               {sidebarCategories.map((category, index) => (
//                 <li key={index}>
//                   <button
//                     className={`flex items-center justify-between w-full px-5 py-2 text-left hover:bg-[#121F1F] ${
//                       index === 0 ? "text-white bg-[#121F1F]" : "text-[#A0AEC0]"
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       <span className="mr-3">{category.icon}</span>
//                       <span>{category.name}</span>
//                     </div>
//                     <span className="text-sm bg-[#1F2A2A] text-[#A0AEC0] px-2 rounded-full">
//                       {category.count}
//                     </span>
//                   </button>
//                 </li>
//               ))}
//             </ul>
            
//             <h3 className="px-5 text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider mt-6 mb-3">
//               Filters
//             </h3>
//             <div className="px-5 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
//                   Difficulty
//                 </label>
//                 <div className="space-y-2">
//                   <label className="flex items-center text-[#A0AEC0]">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-[#00C4B8] rounded" />
//                     <span className="ml-2 text-sm">Beginner</span>
//                   </label>
//                   <label className="flex items-center text-[#A0AEC0]">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-[#00C4B8] rounded" checked />
//                     <span className="ml-2 text-sm">Intermediate</span>
//                   </label>
//                   <label className="flex items-center text-[#A0AEC0]">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-[#00C4B8] rounded" />
//                     <span className="ml-2 text-sm">Advanced</span>
//                   </label>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
//                   Status
//                 </label>
//                 <div className="space-y-2">
//                   <label className="flex items-center text-[#A0AEC0]">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-[#00C4B8] rounded" checked />
//                     <span className="ml-2 text-sm">Active</span>
//                   </label>
//                   <label className="flex items-center text-[#A0AEC0]">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-[#00C4B8] rounded" />
//                     <span className="ml-2 text-sm">Upcoming</span>
//                   </label>
//                   <label className="flex items-center text-[#A0AEC0]">
//                     <input type="checkbox" className="form-checkbox h-4 w-4 text-[#00C4B8] rounded" />
//                     <span className="ml-2 text-sm">Past</span>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="p-4 border-t border-[#1F2A2A]">
//             <button className="w-full py-2 bg-gradient-to-r from-[#00C4B8] to-[#006D66] text-white rounded-lg hover:opacity-90 transition-opacity">
//               Apply Filters
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const words = [
    { text: "Discover" },
    { text: "exciting" },
    { text: "competitions" },
    { text: "for" },
    { text: "developers.", className: "text-[#00C4B8]" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/competitions/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch competitions");

        const data = await response.json();
        console.log("Competitions Data:", data);
        setCompetitions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();

    // Demo data for development
    const demoCompetitions = [
      {
        id: 1,
        name: "React Component Challenge",
        start_date: "2025-03-01",
        end_date: "2025-04-15",
        competition_picture: null,
        description: "Build the most innovative and accessible React components.",
        prize: "$5,000",
        difficulty: "Intermediate"
      },
      {
        id: 2,
        name: "AI Innovation Hackathon",
        start_date: "2025-03-15",
        end_date: "2025-04-30",
        competition_picture: null,
        description: "Develop AI solutions for real-world problems in healthcare.",
        prize: "$10,000",
        difficulty: "Advanced"
      },
      {
        id: 3,
        name: "UI/UX Design Sprint",
        start_date: "2025-03-10",
        end_date: "2025-04-05",
        competition_picture: null,
        description: "Design intuitive and beautiful interfaces for next-gen applications.",
        prize: "$3,500",
        difficulty: "Intermediate"
      },
      {
        id: 4,
        name: "Blockchain DApp Challenge",
        start_date: "2025-04-01",
        end_date: "2025-05-15",
        competition_picture: null,
        description: "Create decentralized applications that solve real problems.",
        prize: "$7,500",
        difficulty: "Advanced"
      },
      {
        id: 5,
        name: "Mobile Game Jam",
        start_date: "2025-03-25",
        end_date: "2025-04-25",
        competition_picture: null,
        description: "Develop an engaging mobile game in 30 days or less.",
        prize: "$4,000",
        difficulty: "Intermediate"
      },
      {
        id: 6,
        name: "Data Visualization Contest",
        start_date: "2025-04-05",
        end_date: "2025-05-05",
        competition_picture: null,
        description: "Transform complex datasets into meaningful visual stories.",
        prize: "$6,000",
        difficulty: "Intermediate"
      }
    ];
    
    setCompetitions(demoCompetitions);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#121212] to-[#001E1E] text-gray-100">
      
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? "md:pl-64" : ""}`}>
        {/* Hero Section */}
        <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]"></div>
          
          <div className="relative z-20 text-center px-4 flex flex-col items-center justify-center space-y-8">
            <p className="text-[#A0AEC0] text-xs sm:text-base">
              Forge your path in code
            </p>
            
            <TypewriterEffectSmooth words={words} />
            
            <p className="text-[#A0AEC0] max-w-lg mx-auto">
              Join thousands of developers competing in challenges designed to push boundaries.
              Showcase your skills, win prizes, and build your portfolio.
            </p>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8">
              <button className="w-40 h-10 rounded-xl bg-gradient-to-r from-[#00C4B8] to-[#006D66] border-transparent text-white text-sm transition-all duration-300 hover:opacity-90">
                Explore Challenges
              </button>
              <button className="w-40 h-10 rounded-xl bg-transparent text-white border border-[#1F2A2A] text-sm transition-all duration-300 hover:border-[#00C4B8]">
                How It Works
              </button>
            </div>
          </div>
        </div>

        {/* Competitions List Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">
              Featured Competitions
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#00C4B8] to-[#006D66] mx-auto rounded-full"></div>
            <p className="mt-4 text-[#A0AEC0] max-w-2xl mx-auto">
              Push your boundaries, collaborate with peers, and build your portfolio 
              with these curated development challenges.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C4B8]"></div>
            </div>
          ) : error ? (
            <div className="bg-[#1F0A0A] border border-[#2A1F1F] text-[#FFA3A3] px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-12 bg-[#121F1F] rounded-lg border border-[#1F2A2A]">
              <svg className="mx-auto h-12 w-12 text-[#A0AEC0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-white">No Competitions</h3>
              <p className="mt-1 text-[#A0AEC0]">There are no competitions available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((comp) => (
                <div key={comp.id} className="bg-gradient-to-b from-[#121212] to-[#121F1F] rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#1F2A2A] hover:border-[#00C4B8]">
                  <div className="h-48 bg-gradient-to-r from-[#00C4B8] to-[#006D66] relative">
                    {comp.competition_picture ? (
                      <img src={comp.competition_picture} alt={comp.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white text-5xl font-semibold opacity-40">{comp.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-[#0A0A0A]/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-white">
                      {comp.difficulty}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{comp.name}</h3>
                      <span className="text-[#00C4B8] font-semibold">{comp.prize}</span>
                    </div>
                    <p className="text-[#A0AEC0] text-sm mb-4 line-clamp-2">
                      {comp.description}
                    </p>
                    <div className="flex justify-between text-sm text-[#A0AEC0] mb-4">
                      <div>
                        <span className="font-semibold">Starts:</span> {new Date(comp.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Ends:</span> {new Date(comp.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      to={`/competitions/${comp.id}`}
                      className="block w-full text-center py-2 px-4 bg-gradient-to-r from-[#00C4B8] to-[#006D66] text-white rounded-md transition-all duration-300 hover:opacity-90"
                    >
                      View Challenge
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-[#121212] to-[#121F1F] border border-[#1F2A2A] rounded-lg p-6 text-center hover:border-[#00C4B8] transition-colors">
              <div className="text-4xl font-bold text-white mb-2">12,500+</div>
              <div className="text-[#A0AEC0]">Developers competing</div>
            </div>
            <div className="bg-gradient-to-b from-[#121212] to-[#121F1F] border border-[#1F2A2A] rounded-lg p-6 text-center hover:border-[#00C4B8] transition-colors">
              <div className="text-4xl font-bold text-white mb-2">$125K</div>
              <div className="text-[#A0AEC0]">In prizes this month</div>
            </div>
            <div className="bg-gradient-to-b from-[#121212] to-[#121F1F] border border-[#1F2A2A] rounded-lg p-6 text-center hover:border-[#00C4B8] transition-colors">
              <div className="text-4xl font-bold text-white mb-2">42</div>
              <div className="text-[#A0AEC0]">Active competitions</div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-24 bg-gradient-to-r from-[#006D66] to-[#00C4B8] rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to showcase your skills?</h3>
            <p className="text-[#E2E8F0] max-w-2xl mx-auto mb-6">
              Join our thriving community of developers and compete in challenges that push your boundaries.
              Build your portfolio, win prizes, and connect with top companies looking for talent.
            </p>
            <button className="px-8 py-3 bg-white text-[#0A0A0A] font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Create Your Developer Profile
            </button>
          </div>
        </div>

        <footer className="bg-gradient-to-b from-[#001E1E] to-[#0A0A0A] border-t border-[#1F2A2A] mt-24 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C4B8] to-[#006D66]"></div>
                  <span className="text-white font-bold text-xl">DevCompete</span>
                </div>
                <p className="text-[#A0AEC0] text-sm">
                  The premier platform for developer competitions and challenges.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Explore</h4>
                <ul className="space-y-2 text-[#A0AEC0]">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/competitions" className="hover:text-white transition-colors">Competitions</Link></li>
                  <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                  <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-[#A0AEC0]">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-[#A0AEC0]">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/cookie" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-[#1F2A2A] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-[#718096] text-sm mb-4 md:mb-0">
                © 2025 DevCompete. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-[#A0AEC0] hover:text-white transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CompetitionsPage;