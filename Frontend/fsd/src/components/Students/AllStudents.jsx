import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Search, Users, Star, MapPin, Calendar } from "lucide-react";
import DJANGO_BASE_URL from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const SkeletonStudentCard = () => (
  <motion.div 
    className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 transform transition-all duration-300 hover:scale-105"
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

const StudentCard = ({ student, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.43, 0.13, 0.23, 0.96] }}
      whileHover={{ y: -5 }}
    >
      <div className="flex flex-col items-center">
        {/* Profile Picture or Initial */}
        {student.profile_picture ? (
          <img
            src={`${DJANGO_BASE_URL}/media/${student.profile_picture}`}
            alt={student.full_name}
            loading="lazy"
            className="w-28 h-28 object-cover rounded-full z-10 relative shadow-lg ring-2 ring-white/50 mb-6"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mb-6">
            <span className="text-gray-400 text-2xl font-display">{student.full_name?.charAt(0) || '?'}</span>
          </div>
        )}

        {/* Student Name */}
        <h3 className="text-xl font-medium text-gray-900 mb-1">
          {student.full_name || "Unnamed Student"}
        </h3>

        {/* Student Details */}
        <div className="text-gray-600 font-medium mb-4">
          {student.department || "No Department"} · {student.year_of_study || "Year N/A"}
        </div>
      </div>

      {/* Detailed Student Information */}
      <div className="space-y-2 text-sm mb-5">
        <div className="flex items-center gap-2 text-gray-600">
          <Star className="w-4 h-4 text-amber-500" />
          <span>GPA: {student.gpa || "N/A"}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{student.city || "Location"}, {student.state || "State"}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>Student ID: {student.student_id || "N/A"}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        className="w-full mt-2 group relative overflow-hidden rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => navigate(`/students/${student.id}`)}
        aria-label={`View profile of ${student.full_name}`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          View Profile
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/60 to-blue-600/0 opacity-0 transition-opacity group-hover:opacity-100"></div>
      </button>
    </motion.div>
  );
};

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId") || null;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/students/?student_id=${studentId}`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchStudents();
  }, []);

  // Filter students with null checks and default empty strings
  const filteredStudents = students.filter(student => {
    const name = student.full_name || '';
    const department = student.department || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(searchTermLower) || 
           department.toLowerCase().includes(searchTermLower);
  });

  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => <SkeletonStudentCard key={index} />);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
            Student Profiles
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Discover talented students and their academic journeys
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
                placeholder="Search students by name or department"
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
            variants={container}
            initial="hidden"
            animate="show"
          >
            {renderSkeletons()}
          </motion.div>
        ) : filteredStudents.length === 0 ? (
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
              No students found
            </motion.h3>
            <motion.p
              className="text-gray-600 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {searchTerm 
                ? `No students match "${searchTerm}". Try a different search.` 
                : "We couldn't find any students matching your criteria. Please check back later."}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredStudents.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllStudents;