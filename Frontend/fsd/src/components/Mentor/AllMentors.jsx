import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {DJANGO_BASE_URL} from "@/lib/utils";
import MentorCard from "@/components/Mentor/MentorCard";
import { UserPlus, Search } from "lucide-react";

const SkeletonMentorCard = () => (
  <motion.div 
    className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse mb-6" />
      <div className="h-5 w-20 bg-gray-300 rounded-full mb-2 animate-pulse" />
      <div className="h-6 w-40 bg-gray-300 animate-pulse mb-1" />
      <div className="h-4 w-32 bg-gray-300 animate-pulse mb-4" />
    </div>
    <div className="space-y-2 mb-5">
      <div className="h-4 w-full bg-gray-300 animate-pulse" />
      <div className="h-4 w-full bg-gray-300 animate-pulse" />
      <div className="h-4 w-full bg-gray-300 animate-pulse" />
    </div>
    <div className="h-10 w-full bg-gray-300 rounded-xl animate-pulse" />
  </motion.div>
);

const AllMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/mentors/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched mentors:", data);
        setMentors(data);
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchMentors();
  }, []);

  // Filter mentors with null checks
  const filteredMentors = mentors.filter(mentor => {
    const name = mentor.full_name || '';
    const specialty = mentor.specialty || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(searchTermLower) || 
    specialty.toLowerCase().includes(searchTermLower);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find Your Mentor
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Connect with experienced professionals who can guide your career journey.
          </motion.p>

          {/* Search Input */}
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search mentors by name or specialty"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>
        </div>

        {loading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {Array(6).fill(0).map((_, index) => <SkeletonMentorCard key={index} />)}
          </motion.div>
        ) : filteredMentors.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UserPlus className="w-8 h-8 text-blue-500" />
            </motion.div>
            <motion.h3
              className="text-xl font-medium text-gray-900 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              No mentors found
            </motion.h3>
            <motion.p
              className="text-gray-600 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {searchTerm 
                ? `No mentors match "${searchTerm}". Try a different search.` 
                : "We couldn't find any mentors matching your criteria. Please check back later as our community grows."}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} onViewProfile={(id) => navigate(`/mentors/${id}`)} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllMentors;
