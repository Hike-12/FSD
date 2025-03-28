import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { WorldMap } from "@/components/ui/Worldmap";
import { AnimatedTestimonialsDemo } from "@/components/ui/animated-testimonials"; 
import { useNavigate } from 'react-router-dom';

const TalentHuntLanding = () => {
  const navigate = useNavigate();

  const handleSignUpCLick = ()=>{
    navigate("/login");
  }
  const testimonials = [
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Sarah Chen",
      designation: "Product Manager at TechFlow",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Emily Watson",
      designation: "Operations Director at CloudScale",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
      name: "Lisa Thompson",
      designation: "VP of Technology at FutureNet",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    }
  ];

  const globalConnections = [
    { start: { lat: 34.0522, lng: -118.2437 }, end: { lat: 35.2271, lng: -80.8431 } },
    { start: { lat: 41.8781, lng: -87.6298 }, end: { lat: -33.4489, lng: -70.6693 } },
    { start: { lat: 60.1695, lng: 24.9354 }, end: { lat: -22.9068, lng: -43.1729 } },
    { start: { lat: -17.8249, lng: 31.0492 }, end: { lat: 55.6761, lng: 12.5683 } },
    { start: { lat: 30.0444, lng: 31.2357 }, end: { lat: 1.3521, lng: 103.8198 } },
    { start: { lat: -4.4419, lng: 15.2663 }, end: { lat: 45.5017, lng: -73.5673 } },
    { start: { lat: 25.7617, lng: -80.1918 }, end: { lat: -37.8136, lng: 144.9631 } },
    { start: { lat: 50.1109, lng: 8.6821 }, end: { lat: -36.8485, lng: 174.7633 } },
    { start: { lat: 14.5995, lng: 120.9842 }, end: { lat: -34.9285, lng: 138.6007 } },
    { start: { lat: 39.7392, lng: -104.9903 }, end: { lat: -8.4095, lng: 115.1889 } }
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
            <h1 className="text-6xl font-bold mb-6 text-blue-600 drop-shadow-lg">
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

            <div className="flex justify-center space-x-4" onClick={handleSignUpCLick}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
                href="/login"
              >
                Sign Up
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

      {/* Testimonials Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            What Our Clients Say
          </h2>
          <AnimatedTestimonialsDemo />      </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-800">
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
                className="bg-gray-700 p-6 rounded-lg text-center hover:scale-105 transition-transform"
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