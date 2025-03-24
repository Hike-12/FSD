import React from "react";
import { motion } from "framer-motion";

const BackgroundBeamsWithCollision = ({ children, className }) => {
  const beams = [
    { translateX: 10, duration: 7, repeatDelay: 3, delay: 2 },
    { translateX: 600, duration: 3, repeatDelay: 3, delay: 4 },
    { translateX: 100, duration: 7, repeatDelay: 7, className: "h-6" },
    { translateX: 400, duration: 5, repeatDelay: 14, delay: 4 },
    { translateX: 800, duration: 11, repeatDelay: 2, className: "h-20" },
    { translateX: 1000, duration: 4, repeatDelay: 2, className: "h-12" },
    { translateX: 1200, duration: 6, repeatDelay: 4, delay: 2, className: "h-6" },
  ];

  return (
    <div className={`h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden ${className}`}>
      {beams.map((beam, index) => (
        <motion.div
          key={index}
          className={`absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent ${beam.className}`}
          animate={{ translateY: "1800px", translateX: beam.translateX || 0 }}
          transition={{ duration: beam.duration || 8, repeat: Infinity, repeatType: "loop", ease: "linear", delay: beam.delay || 0, repeatDelay: beam.repeatDelay || 0 }}
        />
      ))}
      {children}
    </div>
  );
};

export default BackgroundBeamsWithCollision;
