import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  FileText,
  Linkedin,
  Github,
  Globe2,
  Award,
  Star,
  Briefcase,
  Users
} from "lucide-react";
import {DJANGO_BASE_URL} from "@/lib/utils";

const StudentProfile = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await fetch(`${DJANGO_BASE_URL}/api/students/${id}/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("authToken")}`,
                    },
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch student");
                }
                const data = await response.json();
                console.log(data);
                setStudent(data);
            } catch (error) {
                console.error("Error fetching student:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <motion.div
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    if (!student) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.p className="text-xl text-gray-600">
                    The student profile you're looking for doesn't exist or has been removed.
                </motion.p>
            </motion.div>
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
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div 
                className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-8 mb-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -mt-20 -mr-20 opacity-50 z-0"></div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start relative z-10">
                    {student.profile_picture && (
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
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md"></div>
                                <img
                                    src={student.profile_picture.startsWith("http") ? student.profile_picture : `${DJANGO_BASE_URL}${student.profile_picture}`}
                                    alt="Profile"
                                    className="w-36 h-36 object-cover rounded-full shadow-lg ring-4 ring-white relative z-10"
                                />
                            </motion.div>
                        </motion.div>
                    )}
                    
                    <div className="text-center md:text-left flex-1">
                        <motion.div
                            className="flex flex-col md:flex-row md:items-center md:justify-between"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div>
                                <div className="flex items-center justify-center md:justify-start">
                                    <motion.div 
                                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 mb-2"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Student
                                    </motion.div>
                                </div>
                            </div>
                            
                            <motion.div 
                                className="flex mt-3 md:mt-0 justify-center md:justify-start space-x-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {student.linkedin && (
                                    <motion.a 
                                        href={student.linkedin} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-blue-100 p-2 rounded-full text-blue-700 hover:bg-blue-200 transition-colors"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </motion.a>
                                )}
                                {student.github && (
                                    <motion.a 
                                        href={student.github} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-gray-100 p-2 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Github className="w-5 h-5" />
                                    </motion.a>
                                )}
                                {student.portfolio && (
                                    <motion.a 
                                        href={student.portfolio} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-purple-100 p-2 rounded-full text-purple-700 hover:bg-purple-200 transition-colors"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FileText className="w-5 h-5" />
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
                                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {student.year_of_study || "N/A"} Year
                                    </span>
                                </div>
                                
                                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        GPA: {student.gpa || "N/A"}
                                    </span>
                                </div>
                                
                                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {student.department || "N/A"}
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
                    className="md:col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span>{student.total_collaborators || 0} Collaborators</span>
                            </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-blue-500" />
                            Contact Information
                        </h3>
                        
                        <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
                            {student.email && (
                                <motion.div className="flex items-start" variants={item}>
                                    <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="text-gray-700">{student.email}</div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {student.phone_number && (
                                <motion.div className="flex items-start" variants={item}>
                                    <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <div className="text-gray-700">{student.phone_number}</div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {(student.city || student.state || student.country) && (
                                <motion.div className="flex items-start" variants={item}>
                                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Location</div>
                                        <div className="text-gray-700">
                                            {[student.city, student.state, student.country].filter(Boolean).join(", ")}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {student.languages_spoken && (
                                <motion.div className="flex items-start" variants={item}>
                                    <Globe className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Languages</div>
                                        <div className="text-gray-700">{student.languages_spoken}</div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                    
                    <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                            Academic Information
                        </h3>
                        
                        <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
                            {student.education_level && (
                                <motion.div className="flex items-start" variants={item}>
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Education Level</div>
                                        <div className="text-gray-700">{student.education_level}</div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {student.department && (
                                <motion.div className="flex items-start" variants={item}>
                                    <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Department</div>
                                        <div className="text-gray-700">{student.department}</div>
                                    </div>
                                </motion.div>
                            )}
                            
                            <motion.div className="flex items-start" variants={item}>
                                <Star className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <div className="text-sm text-gray-500">GPA</div>
                                    <div className="text-gray-700">
                                        {student.gpa || "N/A"}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
                
                {/* Right Column - Professional & Additional Info */}
                <motion.div 
                    className="md:col-span-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {student.career_goal && (
                        <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                Career Goal
                            </h3>
                            <p className="text-gray-700 whitespace-pre-line">{student.career_goal}</p>
                        </div>
                    )}
                    
                    <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                            Professional Information
                        </h3>
                        
                        <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
                            {student.skills && (
                                <motion.div variants={item}>
                                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                        <Star className="w-4 h-4 mr-2 text-amber-500" />
                                        Skills
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-line">{student.skills}</p>
                                </motion.div>
                            )}
                            
                            {student.certifications && (
                                <motion.div variants={item}>
                                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                        <Award className="w-4 h-4 mr-2 text-indigo-500" />
                                        Certifications
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-line">{student.certifications}</p>
                                </motion.div>
                            )}
                            
                            {student.internships && (
                                <motion.div variants={item}>
                                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                                        Internships
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-line">{student.internships}</p>
                                </motion.div>
                            )}
                            
                            {student.projects && (
                                <motion.div variants={item}>
                                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                                        Projects
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-line">{student.projects}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                    
                    <motion.div 
                        className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-500" />
                            Additional Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.gender && (
                                <motion.div variants={item}>
                                    <div className="text-sm text-gray-500">Gender</div>
                                    <div className="text-gray-700">{student.gender}</div>
                                </motion.div>
                            )}
                            
                            {student.date_of_birth && (
                                <motion.div variants={item}>
                                    <div className="text-sm text-gray-500">Date of Birth</div>
                                    <div className="text-gray-700">{student.date_of_birth}</div>
                                </motion.div>
                            )}
                            
                            {student.nationality && (
                                <motion.div variants={item}>
                                    <div className="text-sm text-gray-500">Nationality</div>
                                    <div className="text-gray-700">{student.nationality}</div>
                                </motion.div>
                            )}
                            
                            {student.postal_code && (
                                <motion.div variants={item}>
                                    <div className="text-sm text-gray-500">Postal Code</div>
                                    <div className="text-gray-700">{student.postal_code}</div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentProfile;