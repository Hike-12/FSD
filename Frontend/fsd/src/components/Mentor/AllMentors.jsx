// AllMentors.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DJANGO_BASE_URL } from "@/lib/utils";
import MentorCard from "@/components/Mentor/MentorCard";
import { UserPlus, Search, Award, Users, Clock } from "lucide-react";
import MentorNavbar from "@/components/Mentor/MentorNavbar";

const SkeletonMentorCard = () => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-[420px] overflow-hidden animate-pulse">
    <div className="p-6 flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-700 mb-4" />
      <div className="h-6 w-40 bg-gray-700 rounded mb-2" />
      <div className="h-5 w-32 bg-gray-700 rounded mb-3" />
      <div className="flex space-x-1 mb-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-700 rounded-full" />
        ))}
      </div>
      <div className="h-4 w-24 bg-gray-700 rounded" />
      <div className="h-5 w-5 bg-gray-700 rounded mt-4" />
    </div>
  </div>
);

const AllMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    available: 0,
    busy: 0,
    premium: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${DJANGO_BASE_URL}/api/mentors/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        setMentors(data);
        
        // Calculate stats
        setStats({
          available: data.filter(m => m.availability_status === 'available').length,
          busy: data.filter(m => m.availability_status === 'busy').length,
          premium: data.filter(m => m.is_premium).length
        });
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const name = mentor.full_name || '';
    const specialty = mentor.specialty || mentor.designation || '';
    const searchTermLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchTermLower) || 
           specialty.toLowerCase().includes(searchTermLower);
  });

  const handleViewProfile = (id) => navigate(`/mentor/${id}`);
  const handleRequestConsultation = (id) => navigate(`/request-consultation/${id}`);

  return (
    <MentorNavbar>
      <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-700 rounded-xl shadow-xl p-6 mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-teal-600/20 rounded-lg">
                <Users className="h-8 w-8 text-teal-400" />
              </div>
              <div>
                <motion.h1
                  className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Find Your Perfect Mentor
                </motion.h1>
                <motion.p
                  className="text-gray-300 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Connect with industry experts who can accelerate your career growth
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/30 transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-600/20 rounded-lg">
                <Users className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-white">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/30 transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Currently Busy</p>
                <p className="text-2xl font-bold text-white">{stats.busy}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/30 transition-all transform hover:-translate-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Premium</p>
                <p className="text-2xl font-bold text-white">{stats.premium}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="max-w-md mx-auto relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="relative shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, specialty or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-full bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Mentors Grid */}
        {loading ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {Array(8).fill(0).map((_, index) => (
              <SkeletonMentorCard key={index} />
            ))}
          </motion.div>
        ) : filteredMentors.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/20 mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UserPlus className="w-8 h-8 text-blue-400" />
            </motion.div>
            <motion.h3
              className="text-xl font-semibold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              No mentors found
            </motion.h3>
            <motion.p
              className="text-gray-400 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {searchTerm 
                ? `No mentors match "${searchTerm}". Try adjusting your search terms.` 
                : "Our mentor network is growing. Check back soon or consider becoming a mentor yourself!"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredMentors.map((mentor) => (
              <MentorCard 
                key={mentor.id}
                mentor={mentor}
                onViewProfile={handleViewProfile}
                onRequestConsultation={handleRequestConsultation}
                darkMode={true}
              />
            ))}
          </motion.div>
        )}
      </div>
    </MentorNavbar>
  );
};

export default AllMentors;