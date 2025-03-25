import React from "react";
import { MapPin, Star, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import DJANGO_BASE_URL from "../utils";

// Function to determine badge color
const getAvailabilityBadgeColor = (status) => {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800";
    case "busy":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const MentorCard = ({ mentor, index }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:shadow-xl"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.43, 0.13, 0.23, 0.96] }}
      whileHover={shouldReduceMotion ? {} : { y: -5 }}
    >
      <div className="flex flex-col items-center">
        {/* Profile Picture */}
        {mentor.profile_picture ? (
          <motion.div
            className="relative mb-6"
            initial={shouldReduceMotion ? {} : { scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-blue-500/10 rounded-full blur-md"
              animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1] }}
              transition={shouldReduceMotion ? {} : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <img
              src={`${DJANGO_BASE_URL}/media/${mentor.profile_picture}`}
              alt={mentor.full_name}
              loading="lazy"
              className="w-28 h-28 object-cover rounded-full z-10 relative shadow-lg ring-2 ring-white/50"
            />
          </motion.div>
        ) : (
          <motion.div
            className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center mb-6"
            initial={shouldReduceMotion ? {} : { scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
          >
            <span className="text-gray-400 text-2xl font-display">{mentor.full_name.charAt(0)}</span>
          </motion.div>
        )}

        {/* Availability Status */}
        <motion.span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAvailabilityBadgeColor(
            mentor.availability_status
          )} mb-2`}
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
        >
          {mentor.availability_status}
        </motion.span>

        {/* Mentor Name */}
        <motion.h3
          className="text-xl font-medium text-gray-900 mb-1"
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
        >
          {mentor.full_name}
        </motion.h3>

        {/* Mentor Type and Department */}
        <motion.div
          className="text-gray-600 font-medium mb-4"
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
        >
          {mentor.mentor_type} {mentor.department && <span> · {mentor.department}</span>}
        </motion.div>
      </div>

      {/* Mentor Details */}
      <motion.div
        className="space-y-2 text-sm mb-5"
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
      >
        <div className="flex items-center gap-2 text-gray-600">
          <Star className="w-4 h-4 text-amber-500" />
          <span>{mentor.years_of_experience} years of experience</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>
            {[mentor.city, mentor.state, mentor.country].filter(Boolean).join(", ") || "Location unavailable"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{mentor.availability_status}</span>
        </div>
      </motion.div>

      {/* View Profile Button */}
      <motion.button
        className="w-full mt-2 group relative overflow-hidden rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => navigate(`/mentor/${mentor.id}`)}
        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.7 }}
        aria-label={`View profile of ${mentor.full_name}`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          View Profile
          <motion.span
            animate={shouldReduceMotion ? {} : { x: [0, 5, 0] }}
            transition={shouldReduceMotion ? {} : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/60 to-blue-600/0 opacity-0 transition-opacity group-hover:opacity-100"></div>
      </motion.button>
    </motion.div>
  );
};

export default MentorCard;
