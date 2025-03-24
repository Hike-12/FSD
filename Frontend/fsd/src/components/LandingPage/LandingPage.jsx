import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { PinContainer } from "@/components/ui/3d-pin"; // nsure correct named import
import { WorldMap } from "@/components/ui/Worldmap"; // Ensure correct named import

const TalentHuntLanding = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Tech Recruiter",
      description: "This platform revolutionized our hiring process!",
      gradientFrom: "from-violet-500",
      gradientVia: "via-purple-500",
      gradientTo: "to-blue-500"
    },
    {
      name: "Michael Chen",
      role: "Startup Founder",
      description: "Finding top talent has never been easier.",
      gradientFrom: "from-green-500",
      gradientVia: "via-teal-500",
      gradientTo: "to-cyan-500"
    },
    {
      name: "Emma Rodriguez",
      role: "HR Director",
      description: "Incredible matching algorithm and user experience.",
      gradientFrom: "from-red-500",
      gradientVia: "via-orange-500",
      gradientTo: "to-yellow-500"
    }
  ];

  const globalConnections = [
    { start: { lat: 40.7128, lng: -74.0060 }, end: { lat: 37.7749, lng: -122.4194 } },
    { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 35.6762, lng: 139.6503 } },
    { start: { lat: -33.8688, lng: 151.2093 }, end: { lat: 55.7558, lng: 37.6173 } }
  ];

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-10">
          <WorldMap 
            dots={globalConnections} 
            lineColor="#0ea5e9" 
          />
        </div>

        <div className="relative z-20 container mx-auto px-4 pt-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Connecting People
            </h1>

            <TypeAnimation
              sequence={[
                'Discover Exceptional Talent',
                1000,
                'Connect with Top Performers',
                1000,
                'Transform Your Hiring',
                1000
              ]}
              wrapper="h2"
              speed={50}
              className="text-4xl font-semibold mb-6 text-blue-300"
              repeat={Infinity}
            />

            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Revolutionizing talent acquisition with a global, AI-powered matching platform
            </p>

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Start Hiring
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="border border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition"
              >
                Find Jobs
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section with Animated Pins */}
      <div className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            What Our Users Say
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {testimonials.map((testimonial, index) => (
              <PinContainer 
                key={index} 
                title={testimonial.role} 
                href="#"
              >
                <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 w-[20rem] h-[20rem]">
                  <h3 className="max-w-xs !pb-2 !m-0 font-bold text-xl text-white">
                    {testimonial.name}
                  </h3>
                  <div className="text-base !m-0 !p-0 font-normal">
                    <span className="text-slate-400">
                      {testimonial.description}
                    </span>
                  </div>
                  <div
                    className={`flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br ${testimonial.gradientFrom} ${testimonial.gradientVia} ${testimonial.gradientTo}`} 
                  />
                </div>
              </PinContainer>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Matching",
                description: "Advanced algorithm that connects the right talent with the right opportunities.",
                icon: "🤖"
              },
              {
                title: "Global Reach",
                description: "Connect with top talent from around the world, breaking geographical barriers.",
                icon: "🌍"
              },
              {
                title: "Seamless Experience",
                description: "Intuitive platform designed for both employers and job seekers.",
                icon: "✨"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-800 p-6 rounded-lg text-center hover:scale-105 transition-transform"
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Transform Your Hiring?
        </h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto">
          Join thousands of companies and professionals who have found their perfect match.
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white text-black px-8 py-4 rounded-full text-xl font-semibold"
        >
          Get Started Now
        </motion.button>
      </div>
    </div>
  );
};

export default TalentHuntLanding;