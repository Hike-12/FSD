import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DJANGO_BASE_URL } from "@/lib/utils";
import MentorCard from "@/components/Mentor/MentorCard";
import { UserPlus, Search, Users, Clock } from "lucide-react";

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

const SkeletonMentorCard = () => (
  <div className="mentor-card-skeleton" style={{ 
    backgroundColor: colors.backgroundLight,
    border: `1px solid ${colors.muted}`,
    borderRadius: '16px',
    height: '420px',
    overflow: 'hidden',
    position: 'relative'
  }}>
    <div className="shimmer" style={{
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)`,
      animation: 'shimmer 1.5s infinite'
    }}></div>
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ 
        width: '96px', 
        height: '96px', 
        borderRadius: '50%', 
        backgroundColor: colors.muted,
        opacity: 0.2,
        marginBottom: '1rem' 
      }} />
      <div style={{ 
        height: '24px', 
        width: '160px', 
        backgroundColor: colors.muted,
        opacity: 0.2,
        borderRadius: '4px',
        marginBottom: '0.5rem' 
      }} />
      <div style={{ 
        height: '20px', 
        width: '128px', 
        backgroundColor: colors.muted,
        opacity: 0.2,
        borderRadius: '4px',
        marginBottom: '0.75rem' 
      }} />
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: colors.muted,
            opacity: 0.2,
            borderRadius: '50%' 
          }} />
        ))}
      </div>
      <div style={{ 
        height: '16px', 
        width: '96px', 
        backgroundColor: colors.muted,
        opacity: 0.2,
        borderRadius: '4px' 
      }} />
      <div style={{ 
        height: '20px', 
        width: '20px', 
        backgroundColor: colors.muted,
        opacity: 0.2,
        borderRadius: '4px',
        marginTop: '1rem' 
      }} />
    </div>
  </div>
);

const AllMentors = () => {
  const role = localStorage.getItem("role") || null;
  if (role === "STUDENT") {
    var student_id = localStorage.getItem("userId") || null;
  }
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    available: 0,
    busy: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${DJANGO_BASE_URL}/api/mentors/?student_id=${student_id}`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        setMentors(data);
        
        // Calculate stats
        setStats({
          available: data.filter(m => m.availability_status === 'available').length,
          busy: data.filter(m => m.availability_status === 'busy').length
        });
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const name = mentor.full_name || '';
    const specialty = mentor.specialty || mentor.designation || '';
    const searchTermLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchTermLower) || 
           specialty.toLowerCase().includes(searchTermLower);
  });

  const handleViewProfile = (id) => navigate(`/mentor/${id}`);
  const handleRequestConsultation = (id) => navigate(`/request-consultation/${id}`);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.accentLight} 0%, transparent 70%)`,
        opacity: 0.1
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
        opacity: 0.1
      }}></div>

      <div style={{ 
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Animated Header */}
        <motion.div 
          style={{ 
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: colors.backgroundLight,
            border: `1px solid ${colors.muted}`,
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${colors.accent}20, ${colors.primary}20)`,
            opacity: 0,
            transition: 'opacity 0.5s ease'
          }} className="group-hover:opacity-100"></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              textAlign: window.innerWidth < 640 ? 'center' : 'left'
            }}>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: `${colors.accent}20`,
                borderRadius: '12px'
              }}>
                <Users style={{ height: '32px', width: '32px', color: colors.accent }} />
              </div>
              <div>
                <motion.h1
                  style={{ 
                    fontSize: window.innerWidth < 640 ? '1.5rem' : '1.75rem',
                    fontWeight: 'bold',
                    background: `linear-gradient(90deg, ${colors.accent}, ${colors.primary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.25rem'
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Find Your Perfect Mentor
                </motion.h1>
                <motion.p
                  style={{ 
                    color: colors.muted,
                    marginTop: '0.25rem',
                    fontSize: window.innerWidth < 640 ? '0.9rem' : '1rem'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Connect with industry experts who can accelerate your career growth
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          style={{ 
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Available Mentors */}
          <motion.div 
            style={{ 
              backgroundColor: colors.backgroundLight,
              border: `1px solid ${colors.muted}`,
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            whileHover={{ 
              backgroundColor: `${colors.backgroundLight}90`,
              transform: 'translateY(-4px)',
              boxShadow: `0 10px 20px rgba(0, 0, 0, 0.2)`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                padding: '0.5rem',
                backgroundColor: `${colors.accent}20`,
                borderRadius: '8px'
              }}>
                <Users style={{ height: '20px', width: '20px', color: colors.accent }} />
              </div>
              <div>
                <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Available</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.text }}>
                  {stats.available}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Busy Mentors */}
          <motion.div 
            style={{ 
              backgroundColor: colors.backgroundLight,
              border: `1px solid ${colors.muted}`,
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            whileHover={{ 
              backgroundColor: `${colors.backgroundLight}90`,
              transform: 'translateY(-4px)',
              boxShadow: `0 10px 20px rgba(0, 0, 0, 0.2)`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                padding: '0.5rem',
                backgroundColor: `${colors.primary}20`,
                borderRadius: '8px'
              }}>
                <Clock style={{ height: '20px', width: '20px', color: colors.primary }} />
              </div>
              <div>
                <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Currently Busy</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.text }}>
                  {stats.busy}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          style={{ 
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto 2rem auto',
            position: 'relative'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '1rem',
              transform: 'translateY(-50%)'
            }}>
              <Search style={{ height: '20px', width: '20px', color: colors.primary }} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, specialty or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: `1px solid ${colors.muted}`,
                borderRadius: '9999px',
                backgroundColor: colors.backgroundLight,
                color: colors.text,
                outline: 'none',
                transition: 'all 0.3s ease',
                fontSize: window.innerWidth < 640 ? '0.875rem' : '0.95rem'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '1rem',
                  transform: 'translateY(-50%)'
                }}
              >
                <svg 
                  style={{ height: '20px', width: '20px', color: colors.muted }} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Mentors Grid */}
        {loading ? (
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 
                                window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '1.5rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {Array(6).fill(0).map((_, index) => (
              <SkeletonMentorCard key={index} />
            ))}
          </motion.div>
        ) : filteredMentors.length === 0 ? (
          <motion.div
            style={{ 
              textAlign: 'center',
              padding: '5rem 1rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: `${colors.primary}20`,
                marginBottom: '1rem'
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UserPlus style={{ width: '32px', height: '32px', color: colors.primary }} />
            </motion.div>
            <motion.h3
              style={{ 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.5rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              No mentors found
            </motion.h3>
            <motion.p
              style={{ 
                color: colors.muted,
                maxWidth: '28rem',
                margin: '0 auto',
                fontSize: window.innerWidth < 640 ? '0.9rem' : '1rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {searchTerm 
                ? `No mentors match "${searchTerm}". Try adjusting your search terms.` 
                : "Our mentor network is growing. Check back soon or consider becoming a mentor yourself!"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 
                                window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '1.5rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredMentors.map((mentor) => (
              <MentorCard 
                key={mentor.id}
                mentor={mentor}
                onViewProfile={handleViewProfile}
                onRequestConsultation={handleRequestConsultation}
                colors={colors}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Add CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .mentor-card-skeleton {
          position: relative;
          overflow: hidden;
        }
        .shimmer {
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
};

export default AllMentors;