export function Meteors({ number = 20 }) {
    const generateMeteors = () => {
      const meteors = [];
      for (let i = 0; i < number; i++) {
        meteors.push(
          <span
            key={i}
            className="animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 bg-white rounded-full shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 8 + 2}s`
            }}
          />
        );
      }
      return meteors;
    };
  
    return (
      <div className="absolute inset-0 overflow-hidden">
        {generateMeteors()}
      </div>
    );
  }