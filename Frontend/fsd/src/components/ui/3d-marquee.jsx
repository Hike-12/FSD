import React from 'react';
import { motion } from 'framer-motion';

export const ThreeDMarquee = ({ 
  images, 
  speed = 5, 
  pauseOnHover = true 
}) => {
  // Duplicate images to create a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex"
        animate={{
          x: [0, `-${images.length * 100}%`],
        }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-1/5 p-2 perspective-1000"
          >
            <motion.div
              className="w-full aspect-square rounded-xl overflow-hidden transform-style-3d"
              whileHover={pauseOnHover ? { scale: 1.05 } : {}}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={image} 
                alt={`Marquee image ${index + 1}`} 
                className="w-full h-full object-cover transform rotate-y-15 hover:rotate-y-0 transition-transform duration-300"
              />
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};