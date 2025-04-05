// MentorCard.jsx
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MentorCard = ({ 
  mentor = {},
  onViewProfile = () => {},
  onRequestConsultation = () => {},
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Safely destructure with defaults
  const {
    id = '',
    full_name = "Unnamed Mentor",
    specialty = "General Mentor",
    designation = specialty,
    avatar_url = "/default-avatar.png",
    location = "Remote",
    rating = 0,
    expertise = [],
    skills = [],
    availability = true,
    bio = "No bio provided yet."
  } = mentor;

  try {
    const allSkills = [...(expertise || []), ...(skills || [])].filter(Boolean);
    const hasSkills = allSkills.length > 0;

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const initials = (full_name || '')
      .split(" ")
      .slice(0, 2)
      .map(n => n[0]?.toUpperCase() || '')
      .join("");

    const renderStars = () => {
      const numericRating = Number(rating) || 0;
      return Array(5).fill(0).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${
            i < Math.floor(numericRating) 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-gray-500"
          }`}
        />
      ));
    };

    return (
      <motion.div
        layout
        className={`bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden h-[420px] flex flex-col hover:border-teal-400/30 transition-all ${className}`}
        initial={{ borderRadius: 12 }}
        animate={{ 
          height: isExpanded ? "auto" : "420px",
          boxShadow: isExpanded 
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" 
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Card Header - Always visible */}
        <div 
          className="p-6 cursor-pointer flex flex-col items-center text-center"
          onClick={toggleExpand}
        >
          <Avatar className="w-24 h-24 mb-4 border-2 border-teal-500/30 shadow-md">
            <AvatarImage src={avatar_url} />
            <AvatarFallback className="bg-teal-900/30 text-teal-400 text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-xl text-white mb-1">
            {full_name}
          </h3>
          
          <Badge variant="secondary" className="mb-3 text-sm bg-teal-900/30 text-teal-400 hover:bg-teal-800/50">
            {designation}
          </Badge>
          
          <div className="flex items-center justify-center space-x-1 mb-3">
            {renderStars()}
            <span className="text-sm text-gray-400 ml-1">({(Number(rating) || 0).toFixed(1)})</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-400">
            <MapPin size={14} className="mr-1 text-teal-400" />
            <span>{location}</span>
          </div>

          <motion.div
            className="mt-4"
            initial={false}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? (
              <ChevronUp size={20} className="text-teal-400" />
            ) : (
              <ChevronDown size={20} className="text-teal-400" />
            )}
          </motion.div>
        </div>
        
        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6"
            >
              <div className="pt-4 border-t border-gray-700">
                {hasSkills && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-teal-400 mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {allSkills.slice(0, 5).map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4 flex items-center justify-center">
                  <Calendar size={16} className="mr-2 text-teal-400" />
                  <span className={`text-sm ${availability ? "text-teal-400" : "text-red-400"}`}>
                    {availability ? "Available for mentorship" : "Currently unavailable"}
                  </span>
                </div>
                
                {bio && bio !== "No bio provided yet." && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-teal-400 mb-1">About</h4>
                    <p className="text-sm text-gray-300 text-center">{bio}</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2 mt-6">
                  <Button 
                    variant="outline"
                    className="bg-transparent text-white border-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile(id);
                    }}
                  >
                    View Full Profile
                  </Button>
                  <Button 
                    className={`${
                      availability 
                        ? "bg-teal-600 hover:bg-teal-700 text-white" 
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!availability}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestConsultation(id);
                    }}
                  >
                    Request Consultation
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  } catch (error) {
    console.error("Error rendering MentorCard:", error);
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 h-[420px] flex flex-col items-center justify-center text-center text-red-400">
        <div className="text-lg font-medium mb-2">Error displaying mentor</div>
        <div className="text-sm">Please try again later</div>
      </div>
    );
  }
};

export default MentorCard;