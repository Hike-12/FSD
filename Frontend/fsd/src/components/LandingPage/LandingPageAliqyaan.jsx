import React, { useRef, useEffect, useState, useCallback } from 'react';
 import * as THREE from 'three';
 import { Canvas, useFrame, useThree } from '@react-three/fiber';
 import { OrbitControls, Stars, Text, Trail } from '@react-three/drei';
 import { motion, AnimatePresence } from 'framer-motion';
 import { TypeAnimation } from 'react-type-animation';
 import { useNavigate } from 'react-router-dom';
 import Dharti from './Dharti';
 // Icons
 import { 
   ArrowRightIcon,
   CheckCircleIcon,
   GlobeIcon,
   BriefcaseIcon,
   User,
   Lightbulb,
   ChartBarIcon
 } from 'lucide-react';
 
 // Define colors palette
 const colors = {
   primary: '#3b82f6',         // Primary color
   primaryDark: '#2563eb',     // Darker shade of primary
   secondary: '#60a5fa',       // Secondary color
   accent: '#7c3aed',          // Accent color
   accentLight: '#a78bfa',     // Lighter accent color
   background: '#050A15',      // Main background color
   backgroundLight: '#0A1428', // Lighter background color
   text: '#f8fafc',            // Text color
   muted: '#94a3b8'            // Muted text color
 };
 
 // City data with coordinates and testimonials
 
 
 // Features for the platform
 const features = [
   {
     icon: <GlobeIcon className="w-6 h-6" />,
     title: "Global Student Network",
     description: "Connect with students from around the world to collaborate, learn, and grow together."
   },
   {
     icon: <BriefcaseIcon className="w-6 h-6" />,
     title: "Expert Mentorship",
     description: "Access guidance from experienced mentors to help you excel in your academic and professional journey."
   },
   {
     icon: <User className="w-6 h-6" />,
     title: "Collaborative Learning",
     description: "Work with peers and mentors on projects, challenges, and competitions to enhance your skills."
   },
   {
     icon: <ChartBarIcon className="w-6 h-6" />,
     title: "Competition Insights",
     description: "Participate in global competitions and track your progress with detailed analytics and feedback."
   },
   {
     icon: <Lightbulb className="w-6 h-6" />,
     title: "Skill Development",
     description: "Enhance your skills through curated challenges and competitions tailored to your interests."
   }
 ];
 
 // Stats for impact section
 const stats = [
  { value: "500K+", label: "Students" },
  { value: "10K+", label: "Mentors" },
  { value: "1,200+", label: "Competitions" },
  { value: "95%", label: "Success Rate" }
];
 
 // Main LandingPageAliqyaan component
 const LandingPageAliqyaan = () => {
   const navigate = useNavigate();
   const [selectedCity, setSelectedCity] = useState(null);
   const [activeTab, setActiveTab] = useState('individual');
   const [scrolled, setScrolled] = useState(false);
   
   const handleCitySelect = useCallback((city) => {
     setSelectedCity(city);
   }, []);
   
   useEffect(() => {
     const handleScroll = () => {
       setScrolled(window.scrollY > 50);
     };
     
     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
   }, []);
 
   return (
     <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen">
       {/* Enhanced fixed header */}
       <motion.header
         className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
           scrolled 
             ? "py-2 bg-[#030718]/90 backdrop-blur-lg shadow-lg" 
             : "py-4 bg-transparent"
         }`}
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       >
         <div className="container mx-auto px-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center">
               <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                 <GlobeIcon className="h-6 w-6 text-white" />
               </div>
               <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                 TalentNexus
               </h1>
             </div>
             
             {/* <div className="hidden md:flex items-center space-x-8">
               <a href="/students" className="text-sm text-blue-100 hover:text-white transition-colors">Students</a>
               <a href="/mentors" className="text-sm text-blue-100 hover:text-white transition-colors">Mentors</a>
               <a href="/competitions" className="text-sm text-blue-100 hover:text-white transition-colors">Competitions</a>
               <button onClick={() => navigate('/contact')} className="text-sm text-blue-100 hover:text-white transition-colors">Contact</button>
             </div>
              */}
             <div className="flex items-center space-x-4">
               <button onClick={() => navigate('/login')} className="hidden md:block px-4 py-2 text-sm text-blue-100 hover:text-white border border-blue-400/30 rounded-lg hover:border-blue-400/60 transition-all duration-300">
                 Sign In
               </button>
               <button 
                 onClick={() => navigate('/how-it-works')} 
                 className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                   scrolled 
                     ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50" 
                     : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/10"
                 }`}
               >
                 Get Started
               </button>
             </div>
           </div>
         </div>
       </motion.header>
 
       {/* Hero section with globe */}
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
                 className="flex flex-col items-center justify-center backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-blue-500/20"
               >
                 <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                   {stat.value}
                 </span>
                 <span className="text-blue-200/70 text-sm mt-1">
                   {stat.label}
                 </span>
               </motion.div>
             ))}
           </div>
         </div>
       </div>
       
       {/* Features section */}
       <div id="features" className="relative py-24">
         <div className="container mx-auto px-6">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             viewport={{ once: true }}
             className="text-center mb-16"
           >
             <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
               Advanced Features for Students and Mentors
             </h2>
             <p className="text-blue-100/70 max-w-2xl mx-auto">
               Our platform connects students and mentors globally, fostering collaboration, learning, and competition.
             </p>
           </motion.div>
           
           {/* Tab navigation */}
           <div className="flex justify-center mb-16">
             <div className="inline-flex p-1 rounded-lg bg-blue-900/20 backdrop-blur-sm border border-blue-500/20">
               <button
                 onClick={() => setActiveTab('individual')}
                 className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
                   activeTab === 'individual'
                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                     : 'text-blue-200 hover:text-white'
                 }`}
               >
                 For Students
               </button>
               <button
                 onClick={() => setActiveTab('company')}
                 className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
                   activeTab === 'company'
                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                     : 'text-blue-200 hover:text-white'
                 }`}
               >
                 For Mentors
               </button>
             </div>
           </div>
           
           {/* Features grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {features.map((feature, index) => (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: index * 0.1 }}
                 viewport={{ once: true }}
                 className="backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-6 hover:bg-blue-900/20 transition-all duration-300"
               >
                 <div className="w-12 h-12 mb-5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                   <div className="text-blue-400">
                     {feature.icon}
                   </div>
                 </div>
                 <h3 className="text-xl font-semibold text-white mb-3">
                   {feature.title}
                 </h3>
                 <p className="text-blue-100/70">
                   {feature.description}
                 </p>
               </motion.div>
             ))}
           </div>
         </div>
       </div>
       
       {/* Testimonial sidebar */}
       <AnimatePresence>
         {selectedCity && (
           <motion.div
             initial={{ opacity: 0, x: 100 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 100 }}
             transition={{ type: "spring", stiffness: 100 }}
             className="fixed top-0 right-0 h-full w-full sm:w-96 backdrop-blur-xl bg-gradient-to-br from-blue-900/40 via-blue-950/40 to-purple-900/30 border-l border-blue-500/20 shadow-2xl z-50 overflow-hidden"
           >
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTIwIDIwaDIwdjIwSDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
             
             <div className="relative h-full py-12 px-8 flex flex-col">
               {/* Close button with animated effect */}
               <button
                 onClick={() => setSelectedCity(null)}
                 className="absolute right-5 top-5 w-8 h-8 rounded-full flex items-center justify-center border border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/30 transition-all duration-300 group"
               >
                 <span className="text-blue-300 group-hover:text-white transition-colors">✕</span>
               </button>
               
               {/* City name with pulsing dot */}
               <div className="mb-6">
                 <div className="inline-flex items-center bg-blue-500/10 backdrop-blur-sm px-4 py-2 rounded-full">
                   <div className="h-2 w-2 rounded-full bg-blue-400 mr-3 animate-pulse" />
                   <h3 className="text-blue-300 font-medium">{selectedCity.name}</h3>
                 </div>
               </div>
               
               {/* Quote with decorative elements */}
               <div className="relative mb-8 flex-1">
                 <div className="absolute -left-1 top-0 text-5xl text-blue-500/20">"</div>
                 <p className="text-blue-50 text-lg leading-relaxed pl-6 italic">
                   {selectedCity.testimonial.quote}
                 </p>
                 <div className="absolute -right-1 bottom-0 text-5xl text-blue-500/20">"</div>
               </div>
               
               {/* Divider with gradient */}
               <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent my-6"></div>
               
               {/* Enhanced testimonial attribution */}
               <div className="bg-blue-900/20 backdrop-blur-md border border-blue-500/20 rounded-xl p-4">
                 <div className="font-medium text-blue-200 text-lg">{selectedCity.testimonial.name}</div>
                 <div className="text-sm text-blue-300/80 font-light">
                   {selectedCity.testimonial.designation}
                 </div>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
       
       {/* Final CTA section */}
       <div className="relative py-24">
         <div className="container mx-auto px-6">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7 }}
             viewport={{ once: true }}
             className="rounded-3xl overflow-hidden relative"
           >
             {/* Background glow and patterns */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-800/30 to-indigo-900/30"></div>
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3ODdiZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHpNMjAgMjBoMjB2MjBIMjB6Ii8+PC9nPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
             <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500 rounded-full filter blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/3"></div>
             
             {/* Content */}
             <div className="relative p-12 md:p-16 flex flex-col items-center text-center">
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white max-w-3xl">
                 Ready to transform your learning journey?
               </h2>
               <p className="text-blue-100/80 mb-8 max-w-2xl">
                 Join thousands of students and mentors using our platform to collaborate, learn, and compete globally.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <button 
                   onClick={() => navigate('/students')}
                   className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300"
                 >
                   Connect With Students
                 </button>
                 <button 
                   onClick={() => navigate('/mentors')}
                   className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300"
                 >
                   Connect With Mentors
                 </button>
               </div>
             </div>
           </motion.div>
         </div>
       </div>
       
       {/* Footer */}
       <footer className="relative py-16 bg-gradient-to-b from-transparent to-[#030718]/80">
         <div className="container mx-auto px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="col-span-2 md:col-span-1">
               <div className="flex items-center mb-4">
                 <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
                   <GlobeIcon className="h-6 w-6 text-white" />
                 </div>
                 <h3 className="ml-3 text-xl font-bold text-white">TalentNexus</h3>
               </div>
               <p className="text-blue-200/60 mb-6">
                 Empowering students and mentors to achieve their goals through collaboration and competitions.
               </p>
               <div className="flex space-x-4">
                 <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                   </svg>
                 </a>
                 <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                   </svg>
                 </a>
                 <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                   </svg>
                 </a>
                 <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
                   </svg>
                 </a>
               </div>
             </div>
 
             <div>
               <h4 className="text-white font-semibold mb-4">Company</h4>
               <ul className="space-y-2">
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">About Us</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Careers</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Blog</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Press</a></li>
               </ul>
             </div>
 
             <div>
               <h4 className="text-white font-semibold mb-4">Resources</h4>
               <ul className="space-y-2">
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Documentation</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Help Center</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Case Studies</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Webinars</a></li>
               </ul>
             </div>
 
             <div>
               <h4 className="text-white font-semibold mb-4">Legal</h4>
               <ul className="space-y-2">
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Terms of Service</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Compliance</a></li>
                 <li><a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors">Security</a></li>
               </ul>
             </div>
           </div>
           
           <div className="mt-12 pt-8 border-t border-blue-500/20 flex flex-col md:flex-row justify-between items-center">
             <p className="text-blue-200/60 text-sm mb-4 md:mb-0">
               © 2025 TalentNexus. All rights reserved.
             </p>
             <div className="flex space-x-6">
               <a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors text-sm">Privacy</a>
               <a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors text-sm">Terms</a>
               <a href="#" className="text-blue-200/60 hover:text-blue-200 transition-colors text-sm">Cookies</a>
             </div>
           </div>
         </div>
         
         {/* Create keyframe animation for floating particles */}
         <style>{`
           @keyframes float {
             0% {
               transform: translateY(0) translateX(0);
             }
             50% {
               transform: translateY(-20px) translateX(10px);
             }
             100% {
               transform: translateY(0) translateX(0);
             }
           }
         `}</style>
       </footer>
     </div>
   );
 };
 
 export default LandingPageAliqyaan;