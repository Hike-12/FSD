export function SparklesCore({ 
    background = 'transparent', 
    minSize = 0.6, 
    maxSize = 1.4, 
    particleDensity = 100, 
    className = '' 
  }) {
    const generateSparkles = () => {
      const sparkles = [];
      for (let i = 0; i < particleDensity; i++) {
        const size = Math.random() * (maxSize - minSize) + minSize;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        
        sparkles.push(
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-50 animate-pulse"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`
            }}
          />
        );
      }
      return sparkles;
    };
  
    return (
      <div 
        className={`absolute inset-0 overflow-hidden ${background} ${className}`}
        style={{ pointerEvents: 'none' }}
      >
        {generateSparkles()}
      </div>
    );
  }
  