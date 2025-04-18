import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
                skills.filter(skill => profileData.skills.includes(skill.name)).map(skill => skill.id) : [],
              competition_type_ids: profileData.preferred_competition_types ? 
                competitionTypes.filter(type => profileData.preferred_competition_types.includes(type.name)).map(type => type.id) : [],
              past_competition_ids: profileData.past_competitions ? 
                pastCompetitions.filter(comp => profileData.past_competitions.includes(comp.name)).map(comp => comp.id) : [],
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitMessage('');
  
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
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${colors.accentLight}`,
          borderTopColor: colors.accent,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          color: colors.text,
          marginTop: '1rem'
        }}>Loading your profile...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: colors.background,
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ 
        backgroundColor: colors.backgroundLight,
        maxWidth: '1200px',
        margin: '0 auto',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ 
          color: colors.text,
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {existingProfile ? 'Update Your Profile' : 'Create Student Profile'}
        </h1>
        
        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '0.5rem'
        }}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: step >= stepNumber ? colors.accent : 'transparent',
                border: `2px solid ${colors.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step >= stepNumber ? colors.text : colors.accent,
                fontWeight: 'bold'
              }}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: step > stepNumber ? colors.accent : colors.muted,
                  opacity: 0.5
                }}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {submitMessage && (
          <div style={{ 
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            border: `1px solid rgba(74, 222, 128, 0.3)`,
            color: colors.text,
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {submitMessage}
          </div>
        )}

        {errors.general && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid rgba(239, 68, 68, 0.3)`,
            color: colors.text,
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div style={{ 
              backgroundColor: colors.background,
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                color: colors.text,
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '0.875rem'
                }}>1</span>
                Personal Information
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
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
                    borderRadius: '6px',
                    padding: '0.75rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.accentLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.accent}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Education Info */}
          {step === 2 && (
            <div style={{ 
              backgroundColor: colors.background,
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                color: colors.text,
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '0.875rem'
                }}>2</span>
                Education Information
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="0.00 - 4.00"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
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
                    borderRadius: '6px',
                    padding: '0.75rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Learning Style</option>
                  <option value="Visual">Visual</option>
                  <option value="Auditory">Auditory</option>
                  <option value="Reading/Writing">Reading/Writing</option>
                  <option value="Kinesthetic">Kinesthetic</option>
                </select>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>Skills</label>
                  <select
                    name="skill_ids"
                    multiple
                    value={formData.skill_ids}
                    onChange={handleMultiSelectChange}
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '6px',
                      padding: '0.5rem',
                      outline: 'none',
                      height: '120px'
                    }}
                  >
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                  <p style={{ 
                    color: colors.muted,
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>Hold Ctrl/Cmd to select multiple</p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.5rem',
                      outline: 'none',
                      height: '120px'
                    }}
                  >
                    {competitionTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <p style={{ 
                    color: colors.muted,
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="Leader, Designer, Developer, etc."
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.5rem',
                      outline: 'none',
                      height: '120px'
                    }}
                  >
                    {pastCompetitions.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                  <p style={{ 
                    color: colors.muted,
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: `1px solid ${colors.accent}`,
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.backgroundLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.accentLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.accent}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {step === 3 && (
            <div style={{ 
              backgroundColor: colors.background,
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                color: colors.text,
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '0.875rem'
                }}>3</span>
                Additional Information
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>Extracurricular Activities</label>
                  <textarea
                    name="extracurricular_activities"
                    value={formData.extracurricular_activities}
                    onChange={handleChange}
                    rows="3"
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="List your activities..."
                  ></textarea>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="List your achievements..."
                  ></textarea>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="List your certifications..."
                  ></textarea>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="List your internships..."
                  ></textarea>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="List your projects..."
                  ></textarea>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>Hobbies</label>
                  <textarea
                    name="hobbies"
                    value={formData.hobbies}
                    onChange={handleChange}
                    rows="3"
                    style={{
                      width: '100%',
                      backgroundColor: colors.backgroundLight,
                      color: colors.text,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="List your hobbies..."
                  ></textarea>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                {/* Closing div tag was missing */}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
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
                    borderRadius: '6px',
                    padding: '0.75rem',
                    outline: 'none'
                  }}
                  placeholder="Describe your career aspirations..."
                ></textarea>
              </div>

              {/* Ensure all divs are properly closed */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="https://linkedin.com/..."
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    color: colors.text,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>Portfolio</label>
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
                      borderRadius: '6px',
                      padding: '0.75rem',
                      outline: 'none'
                    }}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: `1px solid ${colors.accent}`,
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.backgroundLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.accentLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.accent}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review and Submit */}
          {step === 4 && (
            <div style={{ 
              backgroundColor: colors.background,
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                color: colors.text,
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  borderRadius: '50%',
                  fontSize: '0.875rem'
                }}>4</span>
                Review and Submit
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block',
                  color: colors.text,
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>Profile Picture</label>
                <input
                  type="file"
                  name="profile_picture"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{
                    width: '100%',
                    color: colors.text,
                    marginBottom: '1rem'
                  }}
                />
                {existingProfile?.profile_picture && !formData.profile_picture && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Current Profile Picture:</p>
                    <img 
                      src={`${DJANGO_BASE_URL}${existingProfile.profile_picture}`} 
                      alt="Current Profile" 
                      style={{ 
                        maxWidth: '150px', 
                        maxHeight: '150px',
                        borderRadius: '8px',
                        marginTop: '0.5rem'
                      }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ 
                backgroundColor: colors.backgroundLight,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  color: colors.text,
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  borderBottom: `1px solid ${colors.muted}`,
                  paddingBottom: '0.5rem'
                }}>
                  Personal Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Full Name</p>
                    <p style={{ color: colors.text }}>{formData.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Date of Birth</p>
                    <p style={{ color: colors.text }}>{formData.date_of_birth || 'Not provided'}</p>
                  </div>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Gender</p>
                    <p style={{ color: colors.text }}>{formData.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Phone Number</p>
                    <p style={{ color: colors.text }}>{formData.phone_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div style={{ 
                backgroundColor: colors.backgroundLight,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  color: colors.text,
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  borderBottom: `1px solid ${colors.muted}`,
                  paddingBottom: '0.5rem'
                }}>
                  Education Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Education Level</p>
                    <p style={{ color: colors.text }}>{formData.education_level || 'Not provided'}</p>
                  </div>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Department</p>
                    <p style={{ color: colors.text }}>{formData.department || 'Not provided'}</p>
                  </div>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Year of Study</p>
                    <p style={{ color: colors.text }}>{formData.year_of_study || 'Not provided'}</p>
                  </div>
                  <div>
                    <p style={{ color: colors.muted, fontSize: '0.875rem' }}>GPA</p>
                    <p style={{ color: colors.text }}>{formData.gpa || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div style={{ 
                backgroundColor: colors.backgroundLight,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  color: colors.text,
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  borderBottom: `1px solid ${colors.muted}`,
                  paddingBottom: '0.5rem'
                }}>
                  Skills and Preferences
                </h3>
                <div>
                  <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Skills</p>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {formData.skill_ids.length > 0 ? (
                      skills
                        .filter(skill => formData.skill_ids.includes(skill.id))
                        .map(skill => (
                          <span key={skill.id} style={{
                            backgroundColor: colors.accent,
                            color: colors.text,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            {skill.name}
                          </span>
                        ))
                    ) : (
                      <p style={{ color: colors.text }}>No skills selected</p>
                    )}
                  </div>
                </div>
                <div>
                  <p style={{ color: colors.muted, fontSize: '0.875rem' }}>Preferred Competition Types</p>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {formData.competition_type_ids.length > 0 ? (
                      competitionTypes
                        .filter(type => formData.competition_type_ids.includes(type.id))
                        .map(type => (
                          <span key={type.id} style={{
                            backgroundColor: colors.secondary,
                            color: colors.text,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            {type.name}
                          </span>
                        ))
                    ) : (
                      <p style={{ color: colors.text }}>No competition types selected</p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: `1px solid ${colors.accent}`,
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.backgroundLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.text,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.accentLight}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.accent}
                >
                  {existingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentProfileForm;