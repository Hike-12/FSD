import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DJANGO_BASE_URL } from "@/lib/utils";
import { motion } from 'framer-motion';

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

const StudentProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [pastCompetitions, setPastCompetitions] = useState([]);
  const [existingProfile, setExistingProfile] = useState(null);
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
    education_level: '',
    department: '',
    year_of_study: '',
    gpa: '',
    skill_ids: [],
    extracurricular_activities: '',
    achievements: '',
    certifications: '',
    internships: '',
    projects: '',
    competition_type_ids: [],
    preferred_team_roles: '',
    past_competition_ids: [],
    emergency_contact_name: '',
    emergency_contact_number: '',
    hobbies: '',
    career_goal: '',
    languages_spoken: '',
    learning_style: '',
    linkedin: '',
    github: '',
    portfolio: '',
    profile_picture: null,
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setSkills(skillsData.skills || skillsData);

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
        setCompetitionTypes(competitionTypesData.competition_types || competitionTypesData);

        // Fetch past competitions
        const pastCompetitionsResponse = await fetch(`${DJANGO_BASE_URL}/api/competitions/`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
        });
        const pastCompetitionsData = await pastCompetitionsResponse.json();
        setPastCompetitions(pastCompetitionsData.competitions || pastCompetitionsData);

        // Fetch existing profile
        try {
          const profileResponse = await fetch(`${DJANGO_BASE_URL}/api/student/profile/`, {
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
            
            const prefilledData = {
              ...profileData,
              skill_ids: profileData.skills ? 
                skillsData.filter(skill => profileData.skills.includes(skill.name)).map(skill => skill.id) : [],
              competition_type_ids: profileData.preferred_competition_types ? 
                competitionTypesData.filter(type => profileData.preferred_competition_types.includes(type.name)).map(type => type.id) : [],
              past_competition_ids: profileData.past_competitions ? 
                pastCompetitionsData.filter(comp => profileData.past_competitions.includes(comp.name)).map(comp => comp.id) : [],
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

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => Math.min(prev + 1, 4));
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
        ? `${DJANGO_BASE_URL}/api/student/profile/${existingProfile.id}/update/`
        : `${DJANGO_BASE_URL}/api/student/profile/update/`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
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
      
      setTimeout(() => navigate('/dashboard'), 2000);
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
      padding: '2rem',
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
          padding: '2rem',
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
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${colors.muted}`,
          overflow: 'hidden'
        }}>
          <motion.h1 
            variants={itemVariants}
            style={{ 
              color: colors.text,
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              textAlign: 'center',
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.primary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            {existingProfile ? 'Update Your Profile' : 'Create Student Profile'}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            style={{
              color: colors.muted,
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          >
            {existingProfile ? 'Keep your information fresh and up-to-date' : 'Let the world know about your amazing skills!'}
          </motion.p>
        </div>
        
        {/* Animated Progress Steps */}
        <motion.div 
          variants={itemVariants}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '2.5rem',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '44px',
                  height: '44px',
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
              {stepNumber < 4 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '40px' }}
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
                padding: '1.5rem',
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
                  fontSize: '1.5rem',
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
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
                    className="focus:ring-2 focus:ring-accent"
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem',
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
                    padding: '0.75rem 2rem',
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

          {/* Step 2: Education Info */}
          {step === 2 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: '1.5rem',
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
                  fontSize: '1.5rem',
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
                Education Information
              </motion.h2>
              
              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
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
                  }}>Education Level*</label>
                  <select
                    name="education_level"
                    value={formData.education_level}
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
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
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
                  }}>Year of Study</label>
                  <input
                    type="number"
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    min="1"
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
                  }}>GPA</label>
                  <input
                    type="number"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    min="0"
                    max="4.0"
                    step="0.01"
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
                    placeholder="0.00 - 4.00"
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
                }}>Learning Style</label>
                <select
                  name="learning_style"
                  value={formData.learning_style}
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
                  <option value="">Select Learning Style</option>
                  <option value="Visual">Visual</option>
                  <option value="Auditory">Auditory</option>
                  <option value="Reading/Writing">Reading/Writing</option>
                  <option value="Kinesthetic">Kinesthetic</option>
                </select>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',  
                  gap: '1.5rem',
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
                    placeholder="English, Spanish, etc."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>Extracurricular Activities</label>
                  <input
                    type="text"
                    name="extracurricular_activities"
                    value={formData.extracurricular_activities}
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
                    placeholder="Clubs, sports, etc."
                  />
                </motion.div>
              </motion.div>

              <motion.div
                variants={containerVariants}
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
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
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
                    padding: '0.75rem 2rem',
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

          {/* Step 3: Skills & Experience */}
          {step === 3 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: '1.5rem',
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
                  fontSize: '1.5rem',
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
                Skills & Experience
              </motion.h2>
              
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
                }}>Hold Ctrl/Cmd to select multiple skills</p>
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
                }}>Achievements</label>
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
                    resize: 'vertical'
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
                    resize: 'vertical'
                  }}
                  placeholder="List any certifications you've earned"
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
                }}>Internships</label>
                <textarea
                  name="internships"
                  value={formData.internships}
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
                    resize: 'vertical'
                  }}
                  placeholder="Describe your internship experiences"
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
                }}>Projects</label>
                <textarea
                  name="projects"
                  value={formData.projects}
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
                    resize: 'vertical'
                  }}
                  placeholder="Describe projects you've worked on"
                />
              </motion.div>

              <motion.div
                variants={containerVariants}
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
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
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
                    padding: '0.75rem 2rem',
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

          {/* Step 4: Competition & Additional Info */}
          {step === 4 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ 
                backgroundColor: colors.background,
                padding: '1.5rem',
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
                  fontSize: '1.5rem',
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
                Competition & Additional Info
              </motion.h2>
              
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
                }}>Preferred Competition Types</label>
                <select
                  name="competition_type_ids"
                  multiple
                  value={formData.competition_type_ids}
                  onChange={handleMultiSelectChange}
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
                }}>Hold Ctrl/Cmd to select multiple types</p>
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
                }}>Past Competitions</label>
                <select
                  name="past_competition_ids"
                  multiple
                  value={formData.past_competition_ids}
                  onChange={handleMultiSelectChange}
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
                  {pastCompetitions.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
                <p style={{ 
                  color: colors.muted,
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>Hold Ctrl/Cmd to select multiple competitions</p>
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
                }}>Preferred Team Roles</label>
                <input
                  type="text"
                  name="preferred_team_roles"
                  value={formData.preferred_team_roles}
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
                  placeholder="E.g., Developer, Designer, Leader, etc."
                />
              </motion.div>

              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
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
                  }}>Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
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
                  }}>Emergency Contact Number</label>
                  <input
                    type="tel"
                    name="emergency_contact_number"
                    value={formData.emergency_contact_number}
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
                }}>Hobbies</label>
                <input
                  type="text"
                  name="hobbies"
                  value={formData.hobbies}
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
                  placeholder="Your hobbies and interests"
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
                }}>Career Goal</label>
                <textarea
                  name="career_goal"
                  value={formData.career_goal}
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
                    resize: 'vertical'
                  }}
                  placeholder="Describe your career aspirations"
                />
              </motion.div>

              <motion.div 
                variants={containerVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
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
                  }}>LinkedIn Profile</label>
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
                  }}>GitHub Profile</label>
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
                  }}>Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
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
                    placeholder="https://yourportfolio.com"
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
                }}>Profile Picture</label>
                <input
                  type="file"
                  name="profile_picture"
                  onChange={handleFileChange}
                  accept="image/*"
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
                    backgroundColor: colors.backgroundLight,
                    color: colors.text,
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.muted}`,
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
                    padding: '0.75rem 2rem',
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
                          <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 2a6 6 0 1 1-6 6 6 6 0 0 1 6-6z" opacity=".5"/>
                          <path d="M8 0a8 8 0 0 1 7.936 6.5h-2.2A6 6 0 0 0 8 2z"/>
                        </svg>
                      </motion.span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {existingProfile ? 'Update Profile' : 'Create Profile'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        <path d="M1.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z"/>
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

export default StudentProfileForm;