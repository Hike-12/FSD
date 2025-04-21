import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DJANGO_BASE_URL } from "@/lib/utils";

const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#60a5fa',
  accent: '#7c3aed',
  accentLight: '#a78bfa',
  background: '#050A15',
  backgroundLight: '#0A1428',
  text: '#f8fafc',
  muted: '#94a3b8'
};

const StudentTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/student/get-student-teams/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setTeams(data.teams);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = (teamId) => {
    window.location.href = `/team/${teamId}`;
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen p-8 flex justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.accentLight}`,
            borderTopColor: colors.accent,
            borderRadius: '50%',
          }}
        ></motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="ml-4"
          style={{ color: colors.text }}
        >
          Loading your teams...
        </motion.p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 pb-2 relative inline-block"
            style={{ color: colors.text }}
          >
            My Teams
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute bottom-0 left-0 h-0.5"
              style={{ backgroundColor: colors.accent }}
            ></motion.span>
          </h2>
          <p 
            className="text-lg"
            style={{ color: colors.muted }}
          >
            Manage and explore your competition teams
          </p>
        </motion.div>
        
        {teams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl p-8 text-center"
            style={{ 
              backgroundColor: colors.backgroundLight,
              border: `1px solid ${colors.backgroundLight}`,
            }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.accent + '20' }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={colors.accent}
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ color: colors.text }}
              >
                No Teams Found
              </h3>
              <p 
                className="mb-6"
                style={{ color: colors.muted }}
              >
                You're not currently part of any competition teams. Join or create one to get started!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/student/join-team'}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                  }}
                >
                  Join a Team
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/student/create-team'}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.text,
                  }}
                >
                  Create New Team
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {teams.map((team) => (
              <motion.div
                key={team.team_id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.5
                    }
                  }
                }}
                whileHover={{ y: -5 }}
                onClick={() => handleTeamClick(team.team_id)}
                className="rounded-xl p-6 cursor-pointer transition-all duration-300"
                style={{
                  backgroundColor: colors.backgroundLight,
                  border: `1px solid ${colors.backgroundLight}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 
                    className="text-xl font-semibold truncate"
                    style={{ color: colors.text }}
                  >
                    {team.team_name}
                  </h3>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: colors.accent + '20',
                      color: colors.accentLight
                    }}
                  >
                    {team.member_count || 0} members
                  </div>
                </div>
                
                <p 
                  className="mb-4 text-sm"
                  style={{ color: colors.muted }}
                >
                  {team.competition_name || "General Team"}
                </p>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, team.member_count || 0))].map((_, i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full"
                        style={{
                          backgroundColor: colors.muted + '40',
                          border: `2px solid ${colors.backgroundLight}`
                        }}
                      ></div>
                    ))}
                    {team.member_count > 3 && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                        style={{
                          backgroundColor: colors.backgroundLight,
                          border: `2px solid ${colors.backgroundLight}`,
                          color: colors.muted
                        }}
                      >
                        +{team.member_count - 3}
                      </div>
                    )}
                  </div>
                  
                  <motion.div
                    whileHover={{ x: 2 }}
                    className="flex items-center"
                  >
                    <span 
                      className="text-sm mr-2"
                      style={{ color: colors.primary }}
                    >
                      View Team
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={colors.primary}
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h13M12 5l7 7-7 7"/>
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentTeams;