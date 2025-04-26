"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DJANGO_BASE_URL } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [competitionsByDate, setCompetitionsByDate] = useState({});

  const words = [
    { text: "Discover" },
    { text: "exciting" },
    { text: "competitions" },
    { text: "for" },
    { text: "developers.", className: "text-[#3b82f6]" },
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
  }, []);

  // Helper function to format dates consistently
  const formatDateForComparison = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Group competitions by their start dates
  useEffect(() => {
    const groupedCompetitions = {};
    competitions.forEach(comp => {
      const startDate = formatDateForComparison(comp.start_date);
      if (!groupedCompetitions[startDate]) {
        groupedCompetitions[startDate] = [];
      }
      groupedCompetitions[startDate].push(comp);
    });
    setCompetitionsByDate(groupedCompetitions);
  }, [competitions]);

  // Get competitions starting on the selected date
  const selectedDateFormatted = formatDateForComparison(selectedDate);
  const competitionsOnSelectedDate = competitionsByDate[selectedDateFormatted] || [];

  // Function to highlight only start dates of competitions on the calendar
  const highlightStartDates = (date) => {
    const dateStr = formatDateForComparison(date);
    return competitionsByDate[dateStr] ? "highlight-start-date" : undefined;
  };

  // Get today's date in the same format as comp.start_date
  const today = formatDateForComparison(new Date());
  
  // Filter competitions to only show those starting today
  const todaysCompetitions = competitions.filter(comp => 
    formatDateForComparison(comp.start_date) === today
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050A15] via-[#0A1428] to-[#050A15] text-[#f8fafc]">
      
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? "md:pl-64" : ""}`}>
        {/* Hero Section */}
        <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#050A15]/50 to-[#050A15]"></div>
          
          <div className="relative z-20 text-center px-4 flex flex-col items-center justify-center space-y-8">
            <p className="text-[#94a3b8] text-xs sm:text-base">
              Forge your path in code
            </p>
            
            <TypewriterEffectSmooth words={words} />
            
            <p className="text-[#94a3b8] max-w-lg mx-auto">
              Join thousands of developers competing in challenges designed to push boundaries.
              Showcase your skills, win prizes, and build your portfolio.
            </p>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8">
              <button className="w-40 h-10 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] border-transparent text-white text-sm transition-all duration-300 hover:opacity-90">
                Explore Challenges
              </button>
              <button className="w-40 h-10 rounded-xl bg-transparent text-white border border-[#1F2A2A] text-sm transition-all duration-300 hover:border-[#3b82f6]">
                How It Works
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">
              Competition Calendar
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] mx-auto rounded-full"></div>
            <p className="mt-4 text-[#94a3b8] max-w-2xl mx-auto">
              Browse competitions by their start dates. Click on a date to see what competitions begin that day.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
            </div>
          ) : error ? (
            <div className="bg-[#1F0A0A] border border-[#2A1F1F] text-[#FFA3A3] px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="mb-16">
              <div className="bg-[#0A1428] border border-[#1F2A2A] p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="w-full md:w-auto">
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => setSelectedDate(date)}
                      inline
                      className="calendar-dark"
                      dayClassName={date => 
                        highlightStartDates(date) 
                          ? "highlight-start-date" 
                          : undefined
                      }
                      renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled
                      }) => (
                        <div className="flex items-center justify-between px-2 py-2">
                          <button 
                            onClick={decreaseMonth} 
                            disabled={prevMonthButtonDisabled}
                            className="text-gray-400 hover:text-white disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                          </button>
                          <div className="text-lg text-white font-semibold">
                            {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                          </div>
                          <button 
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className="text-gray-400 hover:text-white disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>
                      )}
                    />
                  </div>

                  <div className="w-full md:w-2/3 bg-[#050A15] border border-[#1F2A2A] rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Competitions Starting on {selectedDate.toLocaleDateString()}
                    </h3>
                    
                    {competitionsOnSelectedDate.length > 0 ? (
                      <div className="space-y-4">
                        {competitionsOnSelectedDate.map(comp => (
                          <div key={comp.id} className="flex items-center gap-4 p-3 border border-[#1F2A2A] rounded-lg hover:bg-[#0A1428] transition-colors">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                              {comp.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{comp.name}</h4>
                              <p className="text-sm text-gray-400 line-clamp-1">{comp.description}</p>
                            </div>
                            <Link 
                              to={`/competitions/${comp.id}`}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-gray-400">No competitions starting on this day</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* All Competitions List */}
          <div className="mt-20 text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">
              All Competitions
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] mx-auto rounded-full"></div>
          </div>

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((comp) => (
                <div key={comp.id} className="bg-gradient-to-b from-[#050A15] to-[#0A1428] rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#1F2A2A] hover:border-[#3b82f6]">
                  <div className="h-48 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] relative">
                    {comp.competition_picture ? (
                      <img src={comp.competition_picture} alt={comp.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white text-5xl font-semibold opacity-40">{comp.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-[#050A15]/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-white">
                      {comp.difficulty}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-4">
                      <div className="text-white text-sm font-semibold">
                        Starts: {new Date(comp.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{comp.name}</h3>
                      <span className="text-[#3b82f6] font-semibold">{comp.prize}</span>
                    </div>
                    <p className="text-[#94a3b8] text-sm mb-4 line-clamp-2">
                      {comp.description}
                    </p>
                    <div className="flex justify-between text-sm text-[#94a3b8] mb-4">
                      <div>
                        <span className="font-semibold">Starts:</span> {new Date(comp.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Ends:</span> {new Date(comp.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      to={`/competitions/${comp.id}`}
                      className="block w-full text-center py-2 px-4 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white rounded-md transition-all duration-300 hover:opacity-90"
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
            <div className="bg-gradient-to-b from-[#050A15] to-[#0A1428] border border-[#1F2A2A] rounded-lg p-6 text-center hover:border-[#3b82f6] transition-colors">
              <div className="text-4xl font-bold text-white mb-2">12,500+</div>
              <div className="text-[#94a3b8]">Developers competing</div>
            </div>
            <div className="bg-gradient-to-b from-[#050A15] to-[#0A1428] border border-[#1F2A2A] rounded-lg p-6 text-center hover:border-[#3b82f6] transition-colors">
              <div className="text-4xl font-bold text-white mb-2">$125K</div>
              <div className="text-[#94a3b8]">In prizes this month</div>
            </div>
            <div className="bg-gradient-to-b from-[#050A15] to-[#0A1428] border border-[#1F2A2A] rounded-lg p-6 text-center hover:border-[#3b82f6] transition-colors">
              <div className="text-4xl font-bold text-white mb-2">42</div>
              <div className="text-[#94a3b8]">Active competitions</div>
            </div>
          </div>
          
          {/* Call to Action */}
         
        </div>

        <footer className="bg-gradient-to-b from-[#050A15] to-[#0A1428] border-t border-[#1F2A2A] mt-24 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"></div>
                  <span className="text-white font-bold text-xl">DevCompete</span>
                </div>
                <p className="text-[#94a3b8] text-sm">
                  The premier platform for developer competitions and challenges.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Explore</h4>
                <ul className="space-y-2 text-[#94a3b8]">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/competitions" className="hover:text-white transition-colors">Competitions</Link></li>
                  <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                  <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-[#94a3b8]">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-[#94a3b8]">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/cookie" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-[#1F2A2A] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-[#64748b] text-sm mb-4 md:mb-0">
                © 2025 DevCompete. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
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
      <style jsx global>{`
        .calendar-dark .react-datepicker {
          background-color: #0A1428;
          border-color: #1F2A2A;
          font-family: inherit;
        }
        .calendar-dark .react-datepicker__header {
          background-color: #050A15;
          border-color: #1F2A2A;
        }
        .calendar-dark .react-datepicker__current-month,
        .calendar-dark .react-datepicker__day-name {
          color: white;
        }
        .calendar-dark .react-datepicker__day {
          color: #94a3b8;
        }
        .calendar-dark .react-datepicker__day:hover {
          background-color: #1e293b;
        }
        .calendar-dark .react-datepicker__day--selected {
          background-color: #2563eb;
          color: white;
        }
        .calendar-dark .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6;
          color: white;
        }
        .calendar-dark .highlight-start-date {
          background-color: #2563eb;
          color: white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default CompetitionsPage;