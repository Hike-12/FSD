import React from 'react';
import { motion } from 'framer-motion';

const MarqueeItem = ({ title, description, icon }) => {
  return (
    <div className="flex items-center justify-between bg-black border border-white/10 rounded-2xl px-6 py-4 mx-4 min-w-[400px] hover:bg-white/5 transition-colors duration-300">
      <div>
        <h3 className="text-white text-2xl font-bold">{title}</h3>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>
      <div className="text-blue-500 text-2xl font-bold">{icon}</div>
    </div>
  );
};

const Marquee = () => {
  const testimonials = [
    { title: "Spotlight", description: "which is not overused.", icon: ">" },
    { title: "Trend", description: "is the new trend.", icon: ">" },
    { title: "Design", description: "that speaks volumes.", icon: ">" },
    { title: "Innovation", description: "beyond boundaries.", icon: ">" },
    { title: "Future", description: "is now.", icon: ">" }
  ];

  return (
    <div className="relative w-full overflow-hidden bg-black py-12">
      <div className="flex animate-marquee">
        {[...testimonials, ...testimonials].map((item, index) => (
          <MarqueeItem 
            key={index} 
            title={item.title} 
            description={item.description} 
            icon={item.icon} 
          />
        ))}
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <div className="relative bg-black min-h-screen text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 opacity-50 pointer-events-none"></div>
      
      <div className="relative z-10 text-center max-w-4xl px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
        >
          Aceternity UI
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl text-gray-300 mb-10"
        >
          Design that transcends boundaries, creating experiences that resonate.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
            Get Started
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const AceternityPage = () => {
  return (
    <div className="bg-black">
      <HeroSection />
      <Marquee />
      
      {/* Additional sections can be added here */}
      <div className="bg-black text-white py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">More Sections Coming Soon</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Stay tuned for more innovative design and cutting-edge experiences.
        </p>
      </div>
    </div>
  );
};

export default AceternityPage;