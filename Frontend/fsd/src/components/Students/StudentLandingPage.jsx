import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { 
  Menu, X, ChevronRight, User, LogOut, 
  Moon, Sun, GlobeIcon, BriefcaseIcon, 
  ChartBarIcon, ArrowRightIcon, BookOpen, 
  Trophy, Users, MessageSquare, Mic, MicOff, 
  Sparkles, Volume2, Type, Languages, Contrast,
  Plus, Minus
} from 'lucide-react';
import Dharti from '../LandingPage/Dharti';

// Multi-language content
const translations = {
  en: {
    ui: {
      title: "StudentSphere",
      featuresTitle: "Student Features",
      featuresDesc: "Discover powerful tools and resources designed to enhance your learning experience",
      stats: {
        students: "Students",
        mentors: "Mentors",
        competitions: "Competitions",
        success: "Success Rate"
      },
      accessibility: {
        menu: "Accessibility Menu",
        font: "Font Size",
        contrast: "High Contrast",
        language: "Language",
        voiceHelp: "Voice Commands Help",
        pageGuide: "Page Guide"
      },
      listening: "Listening...",
      stopSpeaking: "Stop speaking",
      navigation: {
        dashboard: "Dashboard",
        competitions: "Competitions",
        mentors: "Mentors",
        profile: "Profile",
        signout: "Sign Out"
      }
    },
    commands: {
      dashboard: "go to dashboard",
      competitions: "open competitions",
      mentors: "show mentors",
      profile: "navigate to profile",
      signout: "sign out",
      increaseFont: "increase font size",
      decreaseFont: "decrease font size",
      darkMode: "toggle dark mode",
      highContrast: "toggle high contrast",
      language: "change language to",
      pageSummary: "read page summary",
      stop: "stop",
      help: "help"
    }
  },
  hi: {
    ui: {
      title: "स्टूडेंटस्फीयर",
      featuresTitle: "छात्र सुविधाएँ",
      featuresDesc: "अपने सीखने के अनुभव को बेहतर बनाने के लिए डिज़ाइन किए गए शक्तिशाली उपकरण और संसाधन खोजें",
      stats: {
        students: "छात्र",
        mentors: "गुरु",
        competitions: "प्रतियोगिताएं",
        success: "सफलता दर"
      },
      accessibility: {
        menu: "एक्सेसिबिलिटी मेनू",
        font: "फॉन्ट आकार",
        contrast: "उच्च कंट्रास्ट",
        language: "भाषा",
        voiceHelp: "वॉइस कमांड सहायता",
        pageGuide: "पेज गाइड"
      },
      listening: "सुन रहा हूँ...",
      stopSpeaking: "बोलना बंद करो",
      navigation: {
        dashboard: "डैशबोर्ड",
        competitions: "प्रतियोगिताएं",
        mentors: "गुरु",
        profile: "प्रोफ़ाइल",
        signout: "साइन आउट"
      }
    },
    commands: {
      dashboard: "डैशबोर्ड पर जाएं",
      competitions: "प्रतियोगिताएं खोलें",
      mentors: "गुरु दिखाएं",
      profile: "प्रोफ़ाइल पर नेविगेट करें",
      signout: "साइन आउट करें",
      increaseFont: "फॉन्ट आकार बढ़ाएं",
      decreaseFont: "फॉन्ट आकार घटाएं",
      darkMode: "डार्क मोड टॉगल करें",
      highContrast: "उच्च कंट्रास्ट टॉगल करें",
      language: "भाषा बदलें",
      pageSummary: "पेज सारांश पढ़ें",
      stop: "रुकें",
      help: "मदद"
    }
  },
  ta: {
    ui: {
      title: "மாணவர்கோளம்",
      featuresTitle: "மாணவர் அம்சங்கள்",
      featuresDesc: "உங்கள் கற்றல் அனுபவத்தை மேம்படுத்த வடிவமைக்கப்பட்ட சக்திவாய்ந்த கருவிகள் மற்றும் வளங்களைக் கண்டறியவும்",
      stats: {
        students: "மாணவர்கள்",
        mentors: "வழிகாட்டிகள்",
        competitions: "போட்டிகள்",
        success: "வெற்றி விகிதம்"
      },
      accessibility: {
        menu: "அணுகல் மெனு",
        font: "எழுத்துரு அளவு",
        contrast: "உயர் தொடர்பு",
        language: "மொழி",
        voiceHelp: "குரல் கட்டளைகள் உதவி",
        pageGuide: "பக்க வழிகாட்டி"
      },
      listening: "கேட்டுக்கொண்டிருக்கிறது...",
      stopSpeaking: "பேசுவதை நிறுத்து",
      navigation: {
        dashboard: "டாஷ்போர்டு",
        competitions: "போட்டிகள்",
        mentors: "வழிகாட்டிகள்",
        profile: "சுயவிவரம்",
        signout: "வெளியேறு"
      }
    },
    commands: {
      dashboard: "டாஷ்போர்டுக்குச் செல்லவும்",
      competitions: "போட்டிகளைத் திறக்கவும்",
      mentors: "வழிகாட்டிகளைக் காட்டு",
      profile: "சுயவிவரத்திற்கு செல்லவும்",
      signout: "வெளியேறவும்",
      increaseFont: "எழுத்துரு அளவை அதிகரிக்கவும்",
      decreaseFont: "எழுத்துரு அளவைக் குறைக்கவும்",
      darkMode: "இருள் பயன்முறையை மாற்றவும்",
      highContrast: "உயர் தொடர்பு மாற்றவும்",
      language: "மொழியை மாற்றவும்",
      pageSummary: "பக்க சுருக்கத்தைப் படிக்கவும்",
      stop: "நிறுத்து",
      help: "உதவி"
    }
  },
  es: {
    ui: {
      title: "StudentSphere",
      featuresTitle: "Características Estudiantiles",
      featuresDesc: "Descubre herramientas poderosas diseñadas para mejorar tu experiencia de aprendizaje",
      stats: {
        students: "Estudiantes",
        mentors: "Mentores",
        competitions: "Competiciones",
        success: "Tasa de éxito"
      },
      accessibility: {
        menu: "Menú de Accesibilidad",
        font: "Tamaño de Fuente",
        contrast: "Alto Contraste",
        language: "Idioma",
        voiceHelp: "Ayuda de Comandos de Voz",
        pageGuide: "Guía de Página"
      },
      listening: "Escuchando...",
      stopSpeaking: "Dejar de hablar",
      navigation: {
        dashboard: "Panel",
        competitions: "Competiciones",
        mentors: "Mentores",
        profile: "Perfil",
        signout: "Cerrar Sesión"
      }
    },
    commands: {
      dashboard: "ir al panel",
      competitions: "abrir competencias",
      mentors: "mostrar mentores",
      profile: "navegar al perfil",
      signout: "cerrar sesión",
      increaseFont: "aumentar tamaño de fuente",
      decreaseFont: "disminuir tamaño de fuente",
      darkMode: "alternar modo oscuro",
      highContrast: "alternar alto contraste",
      language: "cambiar idioma a",
      pageSummary: "leer resumen de página",
      stop: "detener",
      help: "ayuda"
    }
  },
  fr: {
    ui: {
      title: "StudentSphere",
      featuresTitle: "Fonctionnalités Étudiantes",
      featuresDesc: "Découvrez des outils puissants conçus pour améliorer votre expérience d'apprentissage",
      stats: {
        students: "Étudiants",
        mentors: "Mentors",
        competitions: "Compétitions",
        success: "Taux de Réussite"
      },
      accessibility: {
        menu: "Menu d'Accessibilité",
        font: "Taille de Police",
        contrast: "Haut Contraste",
        language: "Langue",
        voiceHelp: "Aide des Commandes Vocales",
        pageGuide: "Guide de Page"
      },
      listening: "Écoute...",
      stopSpeaking: "Arrêter de parler",
      navigation: {
        dashboard: "Tableau de Bord",
        competitions: "Compétitions",
        mentors: "Mentors",
        profile: "Profil",
        signout: "Se Déconnecter"
      }
    },
    commands: {
      dashboard: "aller au tableau de bord",
      competitions: "ouvrir les compétitions",
      mentors: "afficher les mentors",
      profile: "naviguer vers le profil",
      signout: "se déconnecter",
      increaseFont: "augmenter la taille de police",
      decreaseFont: "diminuer la taille de police",
      darkMode: "basculer en mode sombre",
      highContrast: "basculer en haut contraste",
      language: "changer la langue en",
      pageSummary: "lire le résumé de la page",
      stop: "arrêter",
      help: "aide"
    }
  }
};

const features = [
  {
    icon: <GlobeIcon className="w-6 h-6" />,
    title: "Global Student Network",
    description: "Connect with students from around the world to collaborate, learn, and grow together.",
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: <BriefcaseIcon className="w-6 h-6" />,
    title: "Expert Mentorship",
    description: "Access guidance from experienced mentors to help you excel in your academic and professional journey.",
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Study Groups",
    description: "Form or join study groups with peers who share your academic interests and goals.",
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: <ChartBarIcon className="w-6 h-6" />,
    title: "Competition Insights",
    description: "Participate in global competitions and track your progress with detailed analytics and feedback.",
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Learning Resources",
    description: "Access curated educational materials and resources tailored to your courses and interests.",
    color: 'from-amber-500 to-yellow-500'
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Achievement Badges",
    description: "Earn recognition for your accomplishments with verifiable digital badges.",
    color: 'from-rose-500 to-red-500'
  }
];

const stats = [
  { value: "500K+", label: "students" },
  { value: "10K+", label: "mentors" },
  { value: "1,200+", label: "competitions" },
  { value: "95%", label: "success" }
];

const StudentLandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [scrolled, setScrolled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en');
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  // Apply dynamic styles based on accessibility settings
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.lang = language;
  }, [fontSize, highContrast, language]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
          handleVoiceCommand(transcript.trim());
        } else {
          interim += transcript;
        }
      }

      setTranscript(prev => final ? prev + final : prev);
      setInterimTranscript(interim);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, language]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCitySelect = (city) => {
    console.log("Selected city:", city);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const readPageSummary = () => {
    const summary = `
      Welcome to StudentSphere. This page provides an overview of our platform features.
      We have ${stats[0].value} students, ${stats[1].value} mentors, and ${stats[2].value} competitions.
      Key features include: Global Student Network, Expert Mentorship, Study Groups, Competition Insights,
      Learning Resources, and Achievement Badges. You can navigate using voice commands.
    `;
    speak(summary);
  };

  const handleVoiceCommand = (command) => {
    const normalizedCommand = command.toLowerCase();
    console.log('Processing command:', command);

    if (normalizedCommand.includes('stop') && isSpeaking) {
      stopSpeaking();
      return;
    }

    if (normalizedCommand.includes(translations[language].commands.dashboard)) {
      navigate('/student-landing');
      speak(`Navigating to dashboard`);
    } 
    else if (normalizedCommand.includes(translations[language].commands.competitions)) {
      navigate('/student-competitions');
      speak(`Opening competitions`);
    }
    else if (normalizedCommand.includes(translations[language].commands.mentors)) {
      navigate('/mentors');
      speak(`Showing mentors`);
    }
    else if (normalizedCommand.includes(translations[language].commands.profile)) {
      navigate('/student-profile');
      speak(`Navigating to your profile`);
    }
    else if (normalizedCommand.includes(translations[language].commands.signout)) {
      handleLogout();
      speak(`Signing out`);
    }
    else if (normalizedCommand.includes(translations[language].commands.darkMode)) {
      setDarkMode(!darkMode);
      speak(`${darkMode ? 'Turning off dark mode' : 'Turning on dark mode'}`);
    }
    else if (normalizedCommand.includes(translations[language].commands.highContrast)) {
      setHighContrast(!highContrast);
      speak(`${highContrast ? 'Turning off high contrast' : 'Turning on high contrast'}`);
    }
    else if (normalizedCommand.includes(translations[language].commands.increaseFont)) {
      setFontSize(prev => Math.min(prev + 2, 24));
      speak(`Increasing font size`);
    }
    else if (normalizedCommand.includes(translations[language].commands.decreaseFont)) {
      setFontSize(prev => Math.max(prev - 2, 12));
      speak(`Decreasing font size`);
    }
    else if (normalizedCommand.includes('english') || normalizedCommand.includes('अंग्रेज़ी') || normalizedCommand.includes('ஆங்கிலம்')) {
      setLanguage('en');
      speak(`Changing language to English`);
    }
    else if (normalizedCommand.includes('hindi') || normalizedCommand.includes('हिंदी')) {
      setLanguage('hi');
      speak(`Changing language to Hindi`);
    }
    else if (normalizedCommand.includes('tamil') || normalizedCommand.includes('தமிழ்')) {
      setLanguage('ta');
      speak(`Changing language to Tamil`);
    }
    else if (normalizedCommand.includes('spanish') || normalizedCommand.includes('español')) {
      setLanguage('es');
      speak(`Changing language to Spanish`);
    }
    else if (normalizedCommand.includes('french') || normalizedCommand.includes('français')) {
      setLanguage('fr');
      speak(`Changing language to French`);
    }
    else if (normalizedCommand.includes(translations[language].commands.pageSummary)) {
      readPageSummary();
    }
    else if (normalizedCommand.includes(translations[language].commands.help)) {
      setShowVoiceHelp(true);
      const commandsList = Object.values(translations[language].commands)
        .filter(cmd => !['stop', 'help'].includes(cmd));
      speak("Here are available voice commands: " + commandsList.join(", "));
    }
    else {
      console.log('Command not recognized:', command);
      speak("Command not recognized. Say 'help' for available commands.");
    }
  };

  const toggleVoiceControl = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setTranscript('');
      setInterimTranscript(translations[language].ui.listening);
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

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) return path;
    }
    return result || path;
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} ${highContrast ? 'high-contrast' : ''} bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b] min-h-screen`}>
      {/* Accessibility Controls - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-3">
        <button 
          onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
          className="p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          aria-label={t('ui.accessibility.menu')}
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

      {/* Stop Speaking Button */}
      {isSpeaking && (
        <div className="fixed bottom-20 right-4 z-50">
          <button 
            onClick={stopSpeaking}
            className="p-3 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            aria-label={t('ui.stopSpeaking')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Accessibility Menu */}
      {showAccessibilityMenu && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-72 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              {t('ui.accessibility.menu')}
            </h3>
            <button 
              onClick={() => setShowAccessibilityMenu(false)} 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Type className="h-4 w-4" />
                  {t('ui.accessibility.font')}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={decreaseFontSize} 
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    aria-label={t('commands.decreaseFont')}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={increaseFontSize} 
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    aria-label={t('commands.increaseFont')}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {fontSize}px
              </div>
            </div>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Contrast className="h-4 w-4" />
                {t('ui.accessibility.contrast')}
              </span>
              <input 
                type="checkbox" 
                checked={highContrast} 
                onChange={toggleHighContrast}
                className="toggle toggle-primary"
                aria-label={t('commands.highContrast')}
              />
            </label>
            
            <div>
              <label className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300">
                <Languages className="h-4 w-4" />
                {t('ui.accessibility.language')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => changeLanguage('en')} 
                  className={`px-3 py-1 text-xs rounded-full ${
                    language === 'en' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  English
                </button>
                <button 
                  onClick={() => changeLanguage('hi')} 
                  className={`px-3 py-1 text-xs rounded-full ${
                    language === 'hi' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  हिंदी
                </button>
                <button 
                  onClick={() => changeLanguage('ta')} 
                  className={`px-3 py-1 text-xs rounded-full ${
                    language === 'ta' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  தமிழ்
                </button>
                <button 
                  onClick={() => changeLanguage('es')} 
                  className={`px-3 py-1 text-xs rounded-full ${
                    language === 'es' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Español
                </button>
                <button 
                  onClick={() => changeLanguage('fr')} 
                  className={`px-3 py-1 text-xs rounded-full ${
                    language === 'fr' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Français
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => { setShowVoiceHelp(true); setShowAccessibilityMenu(false); }}
              className="flex items-center gap-2 w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Mic className="h-4 w-4" />
              {t('ui.accessibility.voiceHelp')}
            </button>
            
            <button 
              onClick={readPageSummary}
              className="flex items-center gap-2 w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Volume2 className="h-4 w-4" />
              {t('ui.accessibility.pageGuide')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Voice Commands Help */}
      {showVoiceHelp && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowVoiceHelp(false)}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {t('ui.accessibility.voiceHelp')}
              </h3>
              <button 
                onClick={() => setShowVoiceHelp(false)} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(translations[language].commands).map(([key, value]) => (
                key !== 'stop' && key !== 'help' && (
                  <div key={key} className="flex items-start gap-2">
                    <Mic className="h-4 w-4 mt-1 flex-shrink-0 text-blue-500" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "{value}"
                    </p>
                  </div>
                )
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => { setShowVoiceHelp(false); toggleVoiceControl(); }}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="h-4 w-4" />
                {t('commands.darkMode')}
              </button>
              <button 
                onClick={() => setShowVoiceHelp(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {t('commands.stop')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Voice Feedback */}
      {(isListening || transcript) && (
        <div className="fixed bottom-28 right-4 z-50 bg-blue-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg max-w-xs min-w-[240px] border border-blue-700">
          <div className="flex items-start gap-2">
            <Sparkles className="flex-shrink-0 h-4 w-4 mt-1 text-yellow-300" />
            <div>
              {transcript && (
                <p className="font-medium">{transcript}</p>
              )}
              {interimTranscript && (
                <p className="text-blue-200 italic">
                  {interimTranscript}
                  <span className="inline-block ml-1 h-2 w-2 bg-blue-300 rounded-full animate-pulse"></span>
                </p>
              )}
              {isListening && !transcript && !interimTranscript && (
                <p className="text-blue-200 italic">{t('ui.listening')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled 
            ? "py-2 bg-[#0a0a1a]/90 backdrop-blur-lg shadow-lg" 
            : "py-4 bg-transparent"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-4 p-2 rounded-full hover:bg-blue-500/20 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-blue-200" />
              </button>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GlobeIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                {t('ui.title')}
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/student-landing')}
              >
                {t('ui.navigation.dashboard')}
              </button>
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/student-competitions')}
              >
                {t('ui.navigation.competitions')}
              </button>
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/mentors')}
              >
                {t('ui.navigation.mentors')}
              </button>
              <button 
                className="text-sm text-blue-100 hover:text-white transition-colors"
                onClick={() => navigate('/student-profile')}
              >
                {t('ui.navigation.profile')}
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-blue-500/20 transition-colors"
                aria-label={t('commands.darkMode')}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-300" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-300" />
                )}
              </button>
              
              <button 
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500"
              >
                {t('ui.navigation.signout')}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Dharti (3D Globe) */}
      <Dharti onCitySelect={handleCitySelect} />

      {/* Stats section */}
      <div className="relative z-10 py-12 bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-blue-900/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <h3 className="text-3xl font-bold text-blue-200 mb-2">{stat.value}</h3>
                <p className="text-blue-100/80 text-sm">{t(`ui.stats.${stat.label}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="relative z-10 py-20 bg-gradient-to-br from-[#0a0a1a] via-[#111827] to-[#1e1b4b]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('ui.featuresTitle')}</h2>
            <p className="text-blue-100/80 max-w-2xl mx-auto">
              {t('ui.featuresDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
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
              </motion.div>
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
                {t('ui.title')}
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
              &copy; {new Date().getFullYear()} {t('ui.title')}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentLandingPage;