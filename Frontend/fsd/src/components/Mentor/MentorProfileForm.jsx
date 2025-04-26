import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DJANGO_BASE_URL } from '@/lib/utils';

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

const MentorProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [existingProfile, setExistingProfile] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    address: '',
    country: '',
    state: '',
    city: '',
    postal_code: '',
    mentor_type: '',
    department: '',
    expertise: '',
    years_of_experience: '',
    current_company: '',
    current_position: '',
    linkedin: '',
    github: '',
    website: '',
    bio: '',
    certifications: '',
    achievements: '',
    languages_spoken: '',
    availability_status: '',
    available_days: [],
    available_times: '',
    max_teams: '',
    skill_ids: [],
    competition_type_ids: [],
    profile_picture: null
  });
  const [isChecked, setIsChecked] = useState(false);  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch skills
        const skillsResponse = await fetch(`${DJANGO_BASE_URL}/api/skills/`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
        });
        const skillsData = await skillsResponse.json();
        setSkills(skillsData.skills || skillsData || []);

        // Fetch competition types
        const competitionTypesResponse = await fetch(`${DJANGO_BASE_URL}/api/competition-types/`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
        });
        const competitionTypesData = await competitionTypesResponse.json();
        setCompetitionTypes(competitionTypesData.competition_types || competitionTypesData || []);

        // Fetch existing profile
        try {
          const profileResponse = await fetch(`${DJANGO_BASE_URL}/api/mentor/profile/`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
            },
            credentials: 'include',
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setExistingProfile(profileData);
            
            // Ensure skills and competitionTypes are loaded before setting form data
            const currentSkills = skillsData.skills || skillsData || [];
            const currentCompetitionTypes = competitionTypesData.competition_types || competitionTypesData || [];
            
            const prefilledData = {
              ...profileData,
              skill_ids: profileData.skills ? 
                currentSkills.filter(skill => profileData.skills.includes(skill.name)).map(skill => skill.id) : [],
              competition_type_ids: profileData.preferred_competition_types ? 
                currentCompetitionTypes.filter(type => profileData.preferred_competition_types.includes(type.name)).map(type => type.id) : [],
              profile_picture: null
            };
            
            setFormData(prefilledData);
          }
        } catch (error) {
          console.log('No existing profile found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: 'Failed to load necessary data.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, profile_picture: e.target.files[0] }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => parseInt(option.value, 10));
    
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setFormData(prev => ({
        ...prev,
        available_days: [...prev.available_days, name]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        available_days: prev.available_days.filter(day => day !== name)
      }));
    }
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitMessage('');
    setIsSubmitting(true);
  
    try {
      const formDataToSend = new FormData();
      
      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => formDataToSend.append(key, v));
        } else if (value !== null && value !== undefined && key !== 'profile_picture') {
          formDataToSend.append(key, value);
        }
      });
      
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
      
      const endpoint = existingProfile 
        ? `${DJANGO_BASE_URL}/api/mentor/profile/${existingProfile.id}/update/`
        : `${DJANGO_BASE_URL}/api/mentor/profile/update/`;
      
      const response = await fetch(endpoint, {
        method: existingProfile ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Submission failed');
      }
      
      setSubmitMessage(existingProfile 
        ? 'Profile updated successfully!' 
        : 'Profile created successfully!');
      
      setTimeout(() => navigate('/mentor-landing'), 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
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
          style={{ 
            color: colors.text,
            marginTop: '1.5rem',
            fontSize: '1.1rem'
          }}
        >
          Loading your profile...
        </motion.p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: colors.background,
      minHeight: '100vh',
      padding: isMobile ? '1rem' : '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.accentLight} 0%, transparent 70%)`,
        opacity: 0.2
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
        opacity: 0.15
      }}></div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ 
          backgroundColor: colors.backgroundLight,
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: '16px',
          padding: isMobile ? '1rem' : '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 1,
          border: `1px solid ${colors.backgroundLight}`,
          overflow: 'hidden'
        }}
      >
        {/* Header with animated gradient border */}
        <div style={{
          position: 'relative',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${colors.muted}`,
          overflow: 'hidden'
        }}>
          <motion.h1 
            variants={itemVariants}
            style={{ 
              color: colors.text,
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              textAlign: 'center',
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.primary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            {existingProfile ? 'Update Your Mentor Profile' : 'Create Mentor Profile'}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            style={{
              color: colors.muted,
              textAlign: 'center',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            {existingProfile ? 'Keep your information fresh and up-to-date' : 'Share your expertise with students!'}
          </motion.p>
        </div>
        
        {/* Animated Progress Steps */}
        <motion.div 
          variants={itemVariants}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: isMobile ? '1.5rem' : '2.5rem',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: isMobile ? '36px' : '44px',
                  height: isMobile ? '36px' : '44px',
                  borderRadius: '50%',
                  backgroundColor: step >= stepNumber ? colors.accent : 'transparent',
                  border: `2px solid ${colors.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step >= stepNumber ? colors.text : colors.accent,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setStep(stepNumber)}
              >
                {stepNumber}
              </motion.div>
              {stepNumber < 5 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isMobile ? '20px' : '40px' }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '2px',
                    backgroundColor: step > stepNumber ? colors.accent : colors.muted,
                    opacity: 0.5
                  }}
                ></motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Messages */}
        {submitMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              border: `1px solid rgba(74, 222, 128, 0.3)`,
              color: colors.text,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(5px)'
            }}
          >
            {submitMessage}
          </motion.div>
        )}

        {errors.general && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid rgba(239, 68, 68, 0.3)`,
              color: colors.text,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(5px)'
            }}
          >
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `1px solid ${colors.backgroundLight}`,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <motion.h2 
                variants={itemVariants}
                style={{ 
                  color: colors.text,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  boxShadow: `0 0 10px ${colors.accentLight}`
                }}>1</span>
                Personal Information
              </motion.h2>
              
              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: isMobile ? '1rem' : '1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Full Name*</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '16px 12px'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem'
                  }}
                />
              </motion.div>

              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: isMobile ? '1rem' : '1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '2rem',
                  gap: '1rem'
                }}
              >
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `1px solid ${colors.backgroundLight}`,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <motion.h2 
                variants={itemVariants}
                style={{ 
                  color: colors.text,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  boxShadow: `0 0 10px ${colors.accentLight}`
                }}>2</span>
                Professional Information
              </motion.h2>
              
              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: isMobile ? '1rem' : '1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Mentor Type*</label>
                  <select
                    name="mentor_type"
                    value={formData.mentor_type}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '16px 12px'
                    }}
                  >
                    <option value="">Select Mentor Type</option>
                    <option value="Technical">Technical</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Academic">Academic</option>
                    <option value="Career">Career</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Expertise</label>
                  <input
                    type="text"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Years of Experience</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    min="0"
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Current Company</label>
                  <input
                    type="text"
                    name="current_company"
                    value={formData.current_company}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Current Position</label>
                  <input
                    type="text"
                    name="current_position"
                    value={formData.current_position}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Skills*</label>
                <select
                  name="skill_ids"
                  multiple
                  value={formData.skill_ids}
                  onChange={handleMultiSelectChange}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    minHeight: '120px'
                  }}
                >
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
                <p style={{ 
                  color: colors.muted,
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>Hold Ctrl (Windows) or Command (Mac) to select multiple options</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  gap: '1rem'
                }}
              >
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                  </svg>
                  Previous
                </motion.button>
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Social Links & Bio */}
          {step === 3 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `1px solid ${colors.backgroundLight}`,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <motion.h2 
                variants={itemVariants}
                style={{ 
                  color: colors.text,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  boxShadow: `0 0 10px ${colors.accentLight}`
                }}>3</span>
                Social Links & Bio
              </motion.h2>
              
              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: isMobile ? '1rem' : '1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>GitHub</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    placeholder="https://github.com/yourusername"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Personal Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    placeholder="https://yourwebsite.com"
                  />
                </motion.div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Bio*</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  rows="5"
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  placeholder="Tell us about yourself, your experience, and why you want to mentor..."
                />
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Certifications</label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  rows="3"
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  placeholder="List any relevant certifications (separated by commas)"
                />
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Notable Achievements</label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  rows="3"
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  placeholder="List any notable achievements or awards"
                />
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Languages Spoken</label>
                <input
                  type="text"
                  name="languages_spoken"
                  value={formData.languages_spoken}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem'
                  }}
                  placeholder="English, Spanish, French, etc."
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  gap: '1rem'
                }}
              >
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                  </svg>
                  Previous
                </motion.button>
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `1px solid ${colors.backgroundLight}`,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <motion.h2 
                variants={itemVariants}
                style={{ 
                  color: colors.text,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  boxShadow: `0 0 10px ${colors.accentLight}`
                }}>4</span>
                Availability & Preferences
              </motion.h2>
              
              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: isMobile ? '1rem' : '1.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Availability Status*</label>
                  <select
                    name="availability_status"
                    value={formData.availability_status}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '16px 12px'
                    }}
                  >
                    <option value="">Select Availability</option>
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Availability</option>
                    <option value="Unavailable">Currently Unavailable</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Available Times</label>
                  <input
                    type="text"
                    name="available_times"
                    value={formData.available_times}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    placeholder="e.g. Weekdays 6-9pm, Weekends 10am-4pm"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Maximum Teams You Can Mentor*</label>
                  <input
                    type="number"
                    name="max_teams"
                    value={formData.max_teams}
                    onChange={handleChange}
                    min="1"
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Preferred Competition Types*</label>
                <select
                  name="competition_type_ids"
                  multiple
                  value={formData.competition_type_ids}
                  onChange={handleMultiSelectChange}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    minHeight: '120px'
                  }}
                >
                  {competitionTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <p style={{ 
                  color: colors.muted,
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>Hold Ctrl (Windows) or Command (Mac) to select multiple options</p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{ marginBottom: '1.5rem' }}
              >
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>Available Days*</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(100px, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <motion.label 
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: formData.available_days.includes(day) ? colors.accent : colors.backgroundLight,
                        border: `1px solid ${formData.available_days.includes(day) ? colors.accent : colors.muted}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        name={day}
                        checked={formData.available_days.includes(day)}
                        onChange={handleCheckboxChange}
                        style={{
                          appearance: 'none',
                          width: '16px',
                          height: '16px',
                          border: `1px solid ${colors.text}`,
                          borderRadius: '4px',
                          backgroundColor: formData.available_days.includes(day) ? colors.text : 'transparent',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ 
                        color: formData.available_days.includes(day) ? colors.text : colors.muted,
                        fontSize: '0.9rem'
                      }}>
                        {day}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  gap: '1rem'
                }}
              >
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                  </svg>
                  Previous
                </motion.button>
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 5: Profile Picture & Submission */}
          {step === 5 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: isMobile ? '1rem' : '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `1px solid ${colors.backgroundLight}`,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <motion.h2 
                variants={itemVariants}
                style={{ 
                  color: colors.text,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  boxShadow: `0 0 10px ${colors.accentLight}`
                }}>5</span>
                Profile Picture & Finalization
              </motion.h2>
              
              <motion.div 
                variants={itemVariants}
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}
              >
                <div style={{
                  width: isMobile ? '120px' : '150px',
                  height: isMobile ? '120px' : '150px',
                  borderRadius: '50%',
                  backgroundColor: colors.backgroundLight,
                  border: `2px dashed ${colors.muted}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}>
                  {formData.profile_picture ? (
                    <img 
                      src={URL.createObjectURL(formData.profile_picture)} 
                      alt="Profile Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : existingProfile?.profile_picture ? (
                    <img 
                      src={existingProfile.profile_picture} 
                      alt="Current Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill={colors.muted} viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                  )}
                </div>

                <motion.label
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.25rem' : '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.accent}`,
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                  </svg>
                  Upload Profile Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </motion.label>
                <p style={{ 
                  color: colors.muted,
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}>
                  Recommended: Square image, at least 300x300 pixels
                </p>
              </motion.div>

              <motion.div 
  variants={itemVariants}
  style={{ 
    backgroundColor: colors.backgroundLight,
    padding: isMobile ? '1rem' : '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    border: `1px solid ${colors.muted}`
  }}
>
  <h3 style={{ 
    color: colors.text,
    fontSize: isMobile ? '1rem' : '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={colors.accent} viewBox="0 0 16 16">
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
    Review Your Information
  </h3>
  <p style={{ 
    color: colors.muted,
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '1rem'
  }}>
    Please review all the information you've entered before submitting. You can go back to previous steps to make changes if needed.
  </p>
  <div style={{ 
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}>
    <input
      type="checkbox"
      id="consent-checkbox"
      required
      checked={isChecked} // Add this state
      onChange={() => setIsChecked(!isChecked)} // Add this handler
      style={{
        width: '18px',
        height: '18px',
        border: `1px solid ${colors.muted}`,
        borderRadius: '4px',
        backgroundColor: isChecked ? colors.accent : colors.backgroundLight, // Change color when checked
        cursor: 'pointer',
        // Remove appearance: 'none' if you want default behavior
      }}
    />
    <label htmlFor="consent-checkbox" style={{ 
      color: colors.text,
      fontSize: '0.9rem',
      cursor: 'pointer',
      userSelect: 'none' // Prevents text selection when clicking
    }}>
      I confirm that all information provided is accurate and I agree to the terms of service.
    </label>
  </div>
</motion.div>
              <motion.div
                variants={itemVariants}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  gap: '1rem'
                }}
              >
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                  </svg>
                  Previous
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: isSubmitting ? colors.muted : colors.accent,
                    color: colors.text,
                    padding: isMobile ? '0.65rem 1.5rem' : '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ display: 'inline-block' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0a8 8 0 0 0-8 8h1.5a6.5 6.5 0 1 1 6.5 6.5H2.75a.75.75 0 0 0 0 1.5H8a8 8 0 0 0 0-16z"/>
                        </svg>
                      </motion.span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {existingProfile ? 'Update Profile' : 'Create Profile'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                      </svg>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default MentorProfileForm;