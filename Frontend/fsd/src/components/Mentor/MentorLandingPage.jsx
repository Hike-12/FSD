import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, X, ChevronRight, User, LogOut, 
  Moon, Sun, GlobeIcon, BriefcaseIcon, 
  ChartBarIcon, ArrowRightIcon, BookOpen, 
  Trophy, Users, MessageSquare, Mic, MicOff, 
  Sparkles, Volume2, Type, Contrast, Plus, Minus
} from 'lucide-react';
import Dharti from '../LandingPage/Dharti';

const features = [
  {
    icon: <GlobeIcon className="w-6 h-6" />,
    title: "Mentor Network",
    description: "Connect with fellow mentors to share insights and strategies for effective mentoring.",
    color: 'from-indigo-500 to-purple-500'
  },
 
  {
    icon: <Users className="w-6 h-6" />,
    title: "Collaboration Opportunities",
    description: "Collaborate with other mentors on projects and initiatives.",
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: <ChartBarIcon className="w-6 h-6" />,
    title: "Connect and Mentor",
    description: "Connect with students and mentor them to help shape their future.",
    color: 'from-purple-500 to-pink-500'
  }
  
];

const MentorLandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isListening, setIsListening] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  // Apply dynamic styles based on accessibility settings
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [fontSize, highContrast]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleVoiceControl = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} ${highContrast ? 'high-contrast' : ''} bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b] min-h-screen`}>
      {/* Accessibility Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-3">
        <button 
          onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
          className="p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          aria-label="Accessibility Menu"
        >
          <Volume2 className="h-6 w-6" />
        </button>
        
        <button 
          onClick={toggleVoiceControl}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
          aria-label={isListening ? "Stop listening" : "Start voice control"}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
      </div>

      {/* Header */}
     

      {/* Dharti (3D Globe) */}
      <Dharti />

      {/* Features section */}
      <div className="relative z-10 py-20 bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Mentor Features</h2>
            <p className="text-blue-100/80 max-w-2xl mx-auto">
              Discover tools and resources designed to enhance your mentoring experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 shadow-lg overflow-hidden relative`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100/90 mb-4">{feature.description}</p>
                  <button className="flex items-center text-sm font-medium text-white hover:text-blue-200 transition-colors">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-[#0a0a1a] border-t border-blue-900/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GlobeIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                MentorSphere
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <a href="#" className="text-sm text-blue-100/80 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-blue-100/80 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-blue-100/80 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-blue-900/20 text-center">
            <p className="text-sm text-blue-100/60">
              &copy; {new Date().getFullYear()} MentorSphere. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MentorLandingPage;