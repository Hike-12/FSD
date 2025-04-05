import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlobeIcon, User, Lightbulb, ChartBarIcon } from 'lucide-react';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <GlobeIcon className="w-8 h-8 text-blue-400" />,
      title: "Step 1: Explore Opportunities",
      description: "Browse through global competitions, mentorship programs, and collaborative projects tailored to your interests.",
    },
    {
      icon: <User className="w-8 h-8 text-purple-400" />,
      title: "Step 2: Connect with Mentors",
      description: "Find experienced mentors who can guide you through your learning and career journey.",
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-400" />,
      title: "Step 3: Collaborate & Learn",
      description: "Work with peers and mentors on real-world challenges to enhance your skills and gain practical experience.",
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-green-400" />,
      title: "Step 4: Track Your Progress",
      description: "Monitor your growth with detailed analytics and feedback from mentors and peers.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen">
      {/* Header Section */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-30 py-4 bg-[#030718]/90 backdrop-blur-lg shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <GlobeIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
              TalentNexus
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center text-center px-6">
        <div>
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            How It Works
          </motion.h1>
          <p className="text-blue-100/80 text-lg max-w-2xl mx-auto">
            Discover how TalentNexus connects students and mentors globally to foster collaboration, learning, and growth.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-6 hover:bg-blue-900/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 mb-5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-blue-100/70">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-blue-100/80 mb-8 max-w-2xl mx-auto">
          Join thousands of students and mentors using TalentNexus to achieve their goals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/students')}
            className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all duration-300"
          >
            For Students
          </button>
          <button
            onClick={() => navigate('/mentors')}
            className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-blue-100 hover:bg-blue-500/20 transition-all duration-300"
          >
            For Mentors
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;