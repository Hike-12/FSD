import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Search, Users, Star, MapPin, Calendar } from "lucide-react";
import { DJANGO_BASE_URL } from "@/lib/utils";
import { useAuth } from "../../context/AuthContext";

// Color theme matching the previous form
const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#60a5fa',
  accent: '#7c3aed',
  accentLight: '#a78bfa',
  background: '#050A15',
  backgroundLight: '#0A1428',
  text: '#f8fafc',
  muted: '#94a3b8'
};

const sendCollaborationRequest = async (studentId) => {
  try {
    const response = await fetch(`${DJANGO_BASE_URL}/api/collaboration-requests/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to_student_id: studentId }),
    });

    if (!response.ok) throw new Error("Failed to send collaboration request");

    alert("Collaboration request sent successfully!");
  } catch (error) {
    console.error("Error sending collaboration request:", error);
    alert("Failed to send collaboration request. Please try again.");
  }
};

const SkeletonStudentCard = () => (
  <motion.div 
    className="backdrop-blur-md border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]"
    style={{
      backgroundColor: colors.backgroundLight,
    }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-col items-center">
      <div 
        className="w-28 h-28 rounded-full mb-6 animate-pulse"
        style={{ backgroundColor: colors.muted + '20' }}
      />
      <div 
        className="h-5 w-20 rounded-full mb-2 animate-pulse"
        style={{ backgroundColor: colors.muted + '20' }}
      />
      <div 
        className="h-6 w-40 animate-pulse mb-1"
        style={{ backgroundColor: colors.muted + '20' }}
      />
      <div 
        className="h-4 w-32 animate-pulse mb-4"
        style={{ backgroundColor: colors.muted + '20' }}
      />
    </div>
    <div className="space-y-2 mb-5">
      <div 
        className="h-4 w-full animate-pulse"
        style={{ backgroundColor: colors.muted + '20' }}
      />
      <div 
        className="h-4 w-full animate-pulse"
        style={{ backgroundColor: colors.muted + '20' }}
      />
      <div 
        className="h-4 w-full animate-pulse"
        style={{ backgroundColor: colors.muted + '20' }}
      />
    </div>
    <div 
      className="h-10 w-full rounded-lg animate-pulse"
      style={{ backgroundColor: colors.muted + '20' }}
    />
  </motion.div>
);

const StudentCard = ({ student, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="backdrop-blur-md border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: colors.backgroundLight,
      }}
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
            className="w-28 h-28 object-cover rounded-full z-10 relative shadow-lg ring-2 ring-white/20 mb-6"
          />
        ) : (
          <div 
            className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: colors.muted + '20' }}
          >
            <span 
              className="text-2xl font-display"
              style={{ color: colors.text }}
            >
              {student.full_name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Student Name */}
        <h3 
          className="text-xl font-medium mb-1"
          style={{ color: colors.text }}
        >
          {student.full_name || "Unnamed Student"}
        </h3>

        {/* Student Details */}
        <div 
          className="font-medium mb-4"
          style={{ color: colors.muted }}
        >
          {student.department || "No Department"} · {student.year_of_study || "Year N/A"}
        </div>
      </div>

      {/* Detailed Student Information */}
      <div className="space-y-2 text-sm mb-5">
        <div className="flex items-center gap-2" style={{ color: colors.muted }}>
          <Star className="w-4 h-4" style={{ color: colors.accent }} />
          <span>GPA: {student.gpa || "N/A"}</span>
        </div>
        
        <div className="flex items-center gap-2" style={{ color: colors.muted }}>
          <MapPin className="w-4 h-4" style={{ color: colors.muted }} />
          <span>{student.city || "Location"}, {student.state || "State"}</span>
        </div>

        <div className="flex items-center gap-2" style={{ color: colors.muted }}>
          <Users className="w-4 h-4" style={{ color: colors.muted }} />
          <span>Student ID: {student.student_id || "N/A"}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          className="w-full mt-2 group relative overflow-hidden rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2"
          style={{
            backgroundColor: colors.accent,
            color: colors.text,
          }}
          onClick={() => sendCollaborationRequest(student.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Send Collaboration Request
          </span>
          <div 
            className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ 
              background: `linear-gradient(90deg, ${colors.accentLight}, ${colors.accent})`,
            }}
          ></div>
        </button>

        <button
          className="w-full mt-2 group relative overflow-hidden rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2"
          style={{
            backgroundColor: colors.primary,
            color: colors.text,
          }}
          onClick={() => navigate(`/students/${student.id}`)}
          aria-label={`View profile of ${student.full_name}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            View Profile
          </span>
          <div 
            className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ 
              background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
            }}
          ></div>
        </button>
      </div>
    </motion.div>
  );
};

const renderSkeletons = () => {
  return Array(6)
    .fill(0)
    .map((_, index) => <SkeletonStudentCard key={index} />);
};

const RecommendedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId") || null;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/recommended-students/?student_id=${studentId}`, {
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
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-semibold mb-3"
            style={{ color: colors.text }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Student Profiles
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto mb-6"
            style={{ color: colors.muted }}
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
                className="w-full px-4 py-3 pl-10 rounded-full focus:outline-none transition duration-300"
                style={{
                  backgroundColor: colors.backgroundLight,
                  border: `1px solid ${colors.muted}30`,
                  color: colors.text,
                }}
              />
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                style={{ color: colors.muted }}
              />
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: colors.accent + '20' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UserPlus 
                className="w-8 h-8" 
                style={{ color: colors.accent }} 
              />
            </motion.div>
            <motion.h3
              className="text-xl font-medium mb-2"
              style={{ color: colors.text }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              No students found
            </motion.h3>
            <motion.p
              className="max-w-md mx-auto"
              style={{ color: colors.muted }}
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
              <StudentCard key={student.id || index} student={student} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecommendedStudents;