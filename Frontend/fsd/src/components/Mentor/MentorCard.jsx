import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ChevronDown, ChevronUp, Calendar, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DJANGO_BASE_URL } from "@/lib/utils";

const sendConsultationRequest = async (mentorId) => {
  try {
    const response = await fetch(`${DJANGO_BASE_URL}/api/send-consultation-request/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to_mentor_id: mentorId }),
    });

    if (!response.ok) throw new Error("Failed to send consultation request");

    const message = await response.json();
    alert(message.message);
  } catch (error) {
    console.error("Error sending consultation request:", error);
    alert("Failed to send consultation request. Please try again.");
  }
};

const MentorCard = ({ 
  mentor = {},
  onViewProfile = () => {},
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
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <motion.div
      layout
      className={`bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden flex flex-col ${className}`}
      style={{ minHeight: '420px', maxWidth: '100%' }}
      animate={{ height: isExpanded ? "auto" : "420px" }}
      transition={{ duration: 0.2 }}
    >
      {/* Card Header - Always visible */}
      <div 
        className="p-6 cursor-pointer flex flex-col items-center text-center"
        onClick={toggleExpand}
      >
        {/* Avatar */}
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border border-slate-600">
            <AvatarImage src={avatar_url} />
            <AvatarFallback className="bg-slate-700 text-slate-200 text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {availability && (
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-blue-800 text-white px-2 py-1 text-xs">
                <Zap size={12} className="mr-1" /> Available
              </Badge>
            </div>
          )}
        </div>
        
        <h3 className="font-semibold text-xl text-slate-100 mb-1">
          {full_name}
        </h3>
        
        <Badge variant="secondary" className="mb-3 text-sm bg-slate-700 text-slate-200">
          {designation}
        </Badge>
        
        <div className="flex items-center justify-center space-x-1 mb-3">
          {renderStars()}
          <span className="text-sm text-slate-400 ml-1">({(Number(rating) || 0).toFixed(1)})</span>
        </div>
        
        <div className="flex items-center text-sm text-slate-400">
          <MapPin size={14} className="mr-1" />
          <span>{location}</span>
        </div>

        <motion.div
          className="mt-4"
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <ChevronUp size={20} className="text-slate-400" />
          ) : (
            <ChevronDown size={20} className="text-slate-400" />
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
            transition={{ duration: 0.2 }}
            className="px-6 pb-6 border-t border-slate-700"
          >
            <div className="pt-4">
              {hasSkills && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {allSkills.slice(0, 5).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-slate-700 text-slate-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-4 flex items-center justify-center">
                <Calendar size={16} className="mr-2 text-slate-400" />
                <span className={`text-sm ${availability ? "text-blue-400" : "text-red-400"}`}>
                  {availability ? "Available for mentorship" : "Currently unavailable"}
                </span>
              </div>
              
              {bio && bio !== "No bio provided yet." && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-1">About</h4>
                  <p className="text-sm text-slate-300 text-center">{bio}</p>
                </div>
              )}
              
              <div className="flex flex-col gap-2 mt-6">
                <Button 
                  variant="outline"
                  className="bg-transparent text-slate-200 border-slate-600 hover:bg-slate-700"
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
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                  disabled={!availability}
                  onClick={(e) => {
                    e.stopPropagation();
                    sendConsultationRequest(id);
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
};

export default MentorCard;