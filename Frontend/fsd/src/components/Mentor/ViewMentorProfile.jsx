import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Award, 
  Users, 
  Briefcase, 
  Globe, 
  Mail, 
  Phone, 
  Check, 
  FileText,
  Linkedin,
  Github,
  Globe2
} from "lucide-react";
import { DJANGO_BASE_URL } from "@/lib/utils";
import MentorNavbar from "@/components/Mentor/MentorNavbar";

const MentorProfile = () => {
    const { id } = useParams();
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                const response = await fetch(`${DJANGO_BASE_URL}/api/mentors/${id}/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("authToken")}`,
                    },
                    credentials: "include",
                });
                const data = await response.json();
                setMentor(data);
            } catch (error) {
                console.error("Error fetching mentor data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentor();
    }, [id]);

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
          <motion.div
            className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }

    if (!mentor) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
          <motion.div 
            className="text-center p-8 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Mentor Not Found</h2>
            <p className="text-gray-400">
              The mentor you're looking for doesn't exist or has been removed.
            </p>
          </motion.div>
        </div>
      );
    }

    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    const item = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    };

    return (
      <MentorNavbar>
        <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <motion.div 
              className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-xl p-8 mb-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mt-20 -mr-20 opacity-50 z-0"></div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start relative z-10">
                {mentor.profile_picture && (
                  <motion.div 
                    className="mb-6 md:mb-0 md:mr-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-md"></div>
                      <img
                        src={mentor.profile_picture.startsWith("http") ? mentor.profile_picture : `${DJANGO_BASE_URL}${mentor.profile_picture}`}
                        alt="Profile"
                        className="w-36 h-36 object-cover rounded-full shadow-lg ring-4 ring-gray-800 relative z-10"
                      />
                      {mentor.is_verified && (
                        <motion.div 
                          className="absolute bottom-0 right-0 bg-teal-500 p-1 rounded-full z-20 ring-2 ring-gray-800"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
                
                <div className="text-center md:text-left flex-1">
                  <motion.h1
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {mentor.full_name}
                  </motion.h1>
                  <motion.p 
                    className="text-gray-400 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {mentor.mentor_type}{mentor.department ? ` • ${mentor.department}` : ''}
                  </motion.p>

                  <motion.div
                    className="flex flex-col md:flex-row md:items-center md:justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div>
                      <div className="flex items-center justify-center md:justify-start">
                        <motion.div 
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            mentor.availability_status?.toLowerCase() === "available" 
                              ? "bg-teal-600/20 text-teal-400" 
                              : mentor.availability_status?.toLowerCase() === "busy" 
                                ? "bg-yellow-600/20 text-yellow-400" 
                                : "bg-gray-700 text-gray-300"
                          } mb-2`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {mentor.availability_status}
                        </motion.div>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="flex mt-3 md:mt-0 justify-center md:justify-start space-x-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {mentor.linkedin && (
                        <motion.a 
                          href={mentor.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gray-700 p-2 rounded-lg text-blue-400 hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Linkedin className="w-5 h-5" />
                        </motion.a>
                      )}
                      {mentor.github && (
                        <motion.a 
                          href={mentor.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gray-700 p-2 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Github className="w-5 h-5" />
                        </motion.a>
                      )}
                      {mentor.website && (
                        <motion.a 
                          href={mentor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gray-700 p-2 rounded-lg text-teal-400 hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Globe2 className="w-5 h-5" />
                        </motion.a>
                      )}
                    </motion.div>
                  </motion.div>
                  
                  <div className="mt-4 md:mt-2">
                    <motion.div
                      className="flex flex-wrap justify-center md:justify-start gap-3 mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-gray-100">
                          {mentor.average_rating || "N/A"} Rating
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-lg">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-100">
                          {mentor.years_of_experience} Years
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-lg">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-100">
                          {mentor.past_mentorship_count || "0"} Mentorships
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Contact & Personal Info */}
              <motion.div 
                className="md:col-span-1 space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-400" />
                    Contact Information
                  </h3>
                  
                  <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                    {mentor.user?.email && (
                      <motion.div className="flex items-start" variants={item}>
                        <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400">Email</div>
                          <div className="text-gray-100">{mentor.user.email}</div>
                        </div>
                      </motion.div>
                    )}
                    
                    {mentor.phone_number && (
                      <motion.div className="flex items-start" variants={item}>
                        <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400">Phone</div>
                          <div className="text-gray-100">{mentor.phone_number}</div>
                        </div>
                      </motion.div>
                    )}
                    
                    {(mentor.city || mentor.state || mentor.country) && (
                      <motion.div className="flex items-start" variants={item}>
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400">Location</div>
                          <div className="text-gray-100">
                            {[mentor.city, mentor.state, mentor.country].filter(Boolean).join(", ")}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {mentor.languages_spoken && (
                      <motion.div className="flex items-start" variants={item}>
                        <Globe className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400">Languages</div>
                          <div className="text-gray-100">{mentor.languages_spoken}</div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    Availability
                  </h3>
                  
                  <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                    {mentor.available_days && (
                      <motion.div className="flex items-start" variants={item}>
                        <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400">Available Days</div>
                          <div className="text-gray-100">{mentor.available_days}</div>
                        </div>
                      </motion.div>
                    )}
                    
                    {mentor.available_times && (
                      <motion.div className="flex items-start" variants={item}>
                        <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400">Available Times</div>
                          <div className="text-gray-100">{mentor.available_times}</div>
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div className="flex items-start" variants={item}>
                      <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-400">Current Teams</div>
                        <div className="text-gray-100">
                          {mentor.current_teams_count || "0"} / {mentor.max_teams || "N/A"}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Right Column - Bio & Professional Info */}
              <motion.div 
                className="md:col-span-2 space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {mentor.bio && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-400" />
                      Biography
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">{mentor.bio}</p>
                  </div>
                )}
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                    Professional Information
                  </h3>
                  
                  <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={item}>
                      {mentor.current_position && (
                        <div>
                          <div className="text-sm text-gray-400">Current Position</div>
                          <div className="text-gray-100 font-medium">
                            {mentor.current_position} 
                            {mentor.current_company && <span className="text-gray-300"> at {mentor.current_company}</span>}
                          </div>
                        </div>
                      )}
                      
                      {mentor.expertise && (
                        <div>
                          <div className="text-sm text-gray-400">Expertise</div>
                          <div className="text-gray-100 font-medium">{mentor.expertise}</div>
                        </div>
                      )}
                    </motion.div>
                    
                    {mentor.certifications && (
                      <motion.div variants={item}>
                        <h4 className="text-md font-medium text-white mb-2 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-purple-400" />
                          Certifications
                        </h4>
                        <p className="text-gray-300 whitespace-pre-line">{mentor.certifications}</p>
                      </motion.div>
                    )}
                    
                    {mentor.achievements && (
                      <motion.div variants={item}>
                        <h4 className="text-md font-medium text-white mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-amber-400" />
                          Achievements
                        </h4>
                        <p className="text-gray-300 whitespace-pre-line">{mentor.achievements}</p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                
                <motion.div 
                  className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Additional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentor.gender && (
                      <motion.div variants={item}>
                        <div className="text-sm text-gray-400">Gender</div>
                        <div className="text-gray-100">{mentor.gender}</div>
                      </motion.div>
                    )}
                    
                    {mentor.date_of_birth && (
                      <motion.div variants={item}>
                        <div className="text-sm text-gray-400">Date of Birth</div>
                        <div className="text-gray-100">{mentor.date_of_birth}</div>
                      </motion.div>
                    )}
                    
                    {mentor.created_at && (
                      <motion.div variants={item}>
                        <div className="text-sm text-gray-400">Member Since</div>
                        <div className="text-gray-100">{new Date(mentor.created_at).toLocaleDateString()}</div>
                      </motion.div>
                    )}
                    
                    {mentor.updated_at && (
                      <motion.div variants={item}>
                        <div className="text-sm text-gray-400">Last Updated</div>
                        <div className="text-gray-100">{new Date(mentor.updated_at).toLocaleDateString()}</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </MentorNavbar>
    );
};

export default MentorProfile;