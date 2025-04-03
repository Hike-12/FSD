import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DJANGO_BASE_URL from "@/lib/utils";

const StudentProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
        try {
          const skillsResponse = await fetch(`${DJANGO_BASE_URL}/api/skills/`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
            },
            credentials: 'include',
          });
          const skillsData = await skillsResponse.json();
          if (skillsData.skills) {
            setSkills(skillsData.skills);
          } else {
            setSkills(skillsData);
          }
        } catch (error) {
          console.error('Error fetching skills data:', error);
          setErrors({ general: 'Failed to load skills. Please try again later.' });
        }
        
        // Fetch competition types
        try {
          const competitionTypesResponse = await fetch(`${DJANGO_BASE_URL}/api/competition-types/`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
            },
            credentials: 'include',
          });
          const competitionTypesData = await competitionTypesResponse.json();
          if (competitionTypesData.competition_types) {
            setCompetitionTypes(competitionTypesData.competition_types);
          } else {
            setCompetitionTypes(competitionTypesData);
          }
        } catch (error) {
          console.error('Error fetching competition types data:', error);
          setErrors({ general: 'Failed to load competition types.' });
        }
        
        // Fetch past competitions
        try {
          const pastCompetitionsResponse = await fetch(`${DJANGO_BASE_URL}/api/competitions/`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
            },
            credentials: 'include',
          });
          const pastCompetitionsData = await pastCompetitionsResponse.json();
          if (pastCompetitionsData.competitions) {
            setPastCompetitions(pastCompetitionsData.competitions);
          } else {
            setPastCompetitions(pastCompetitionsData);
          }
        } catch (error) {
          console.error('Error fetching past competitions data:', error);
          setErrors({ general: 'Failed to load past competitions.' });
        }
        
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
          console.log('Profile response:', profileResponse);
          if (!profileResponse.ok) throw new Error('No profile found');
          
          const profileData = await profileResponse.json();
          setExistingProfile(profileData);
          
          // Pre-fill form with existing data
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profile_picture: e.target.files[0]
    });
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => parseInt(option.value, 10));
    
    setFormData({
      ...formData,
      [name]: selectedValues
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitMessage('');
  
    try {
      const formDataToSend = new FormData();
      
      // Append simple string/number fields
      Object.entries(formData).forEach(([key, value]) => {
        // Skip arrays and files, they will be handled separately
        if (!Array.isArray(value) && key !== 'profile_picture' && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      // Append arrays
      if (Array.isArray(formData.skill_ids)) {
        formData.skill_ids.forEach(id => formDataToSend.append('skill_ids', id));
      }
      
      if (Array.isArray(formData.competition_type_ids)) {
        formData.competition_type_ids.forEach(id => formDataToSend.append('competition_type_ids', id));
      }
      
      if (Array.isArray(formData.past_competition_ids)) {
        formData.past_competition_ids.forEach(id => formDataToSend.append('past_competition_ids', id));
      }
      
      // Append file
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
      
      // Debug: Show all FormData entries
      console.log("Final FormData entries:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // Send the request
      let response;
      if (existingProfile) {
        console.log(`Sending POST request to /api/student/profile/${existingProfile.id}/update/`);
        
        response = await fetch(`${DJANGO_BASE_URL}/api/student/profile/${existingProfile.id}/update/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
          body: formDataToSend,
        });
      } else {
        console.log('Sending POST request to /api/student/profile/update/');
        response = await fetch(`${DJANGO_BASE_URL}/api/student/profile/update/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
          body: formDataToSend,
        });
      }
      
      // Log response status
      console.log(`Response status: ${response.status}`);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
      
      if (!response.ok) {
        throw { response: { data: responseData || responseText } };
      }
      
      setSubmitMessage(existingProfile 
        ? 'Profile updated successfully!' 
        : 'Profile created successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        {existingProfile ? 'Update Your Student Profile' : 'Create Your Student Profile'}
      </h1>
      
      {submitMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {submitMessage}
        </div>
      )}
      
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name*</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">State/Province</label>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {/* Education Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Education Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Education Level*</label>
              <select
                name="education_level"
                value={formData.education_level || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select Education Level</option>
                <option value="High School">High School</option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Master's">Master's</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
              {errors.education_level && <p className="text-red-500 text-xs mt-1">{errors.education_level}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Year of Study</label>
              <input
                type="number"
                name="year_of_study"
                value={formData.year_of_study || ''}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">GPA</label>
              <input
                type="number"
                name="gpa"
                value={formData.gpa || ''}
                onChange={handleChange}
                min="0"
                max="4.0"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="0.00 - 4.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Learning Style</label>
              <select
                name="learning_style"
                value={formData.learning_style || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Learning Style</option>
                <option value="Visual">Visual</option>
                <option value="Auditory">Auditory</option>
                <option value="Reading/Writing">Reading/Writing</option>
                <option value="Kinesthetic">Kinesthetic</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <select 
                name="skill_ids" 
                multiple 
                value={formData.skill_ids || []} 
                onChange={handleMultiSelectChange} 
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
              >
                {Array.isArray(skills) && skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Competition Types</label>
              <select
                name="competition_type_ids"
                multiple
                value={formData.competition_type_ids || []}
                onChange={handleMultiSelectChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
              >
                {Array.isArray(competitionTypes) && competitionTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple types</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Team Roles</label>
              <input
                type="text"
                name="preferred_team_roles"
                value={formData.preferred_team_roles || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Leader, Designer, Developer, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Past Competitions</label>
              <select
                name="past_competition_ids"
                multiple
                value={formData.past_competition_ids || []}
                onChange={handleMultiSelectChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
              >
                {Array.isArray(pastCompetitions) && pastCompetitions.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple competitions</p>
            </div>
          </div>
        </div>
        
        {/* Extra Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Extracurricular Activities</label>
              <textarea
                name="extracurricular_activities"
                value={formData.extracurricular_activities || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your extracurricular activities..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Certifications</label>
              <textarea
                name="certifications"
                value={formData.certifications || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your Certifications..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Internships</label>
              <textarea
                name="internships"
                value={formData.internships || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your Internships..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Projects</label>
              <textarea
                name="projects"
                value={formData.projects || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your Projects..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Achievements</label>
              <textarea
                name="achievements"
                value={formData.achievements || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your achievements..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Hobbies</label>
              <textarea
                name="hobbies"
                value={formData.hobbies || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your hobbies..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Career Goal</label>
              <textarea
                name="career_goal"
                value={formData.career_goal || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Describe your career goals..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Languages Spoken</label>
            <input
              type="text"
              name="languages_spoken"
              value={formData.languages_spoken || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="English, Spanish, etc."
            />
          </div>
        </div>
        
        {/* Emergency Contact Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact Number</label>
              <input
                type="tel"
                name="emergency_contact_number"
                value={formData.emergency_contact_number || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {/* Social Media Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Social Media & Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">GitHub</label>
              <input
                type="url"
                name="github"
                value={formData.github || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Portfolio</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>
        
        {/* Profile Picture Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Profile Picture</label>
            <input
              type="file"
              name="profile_picture"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              accept="image/*"
            />
            {existingProfile && existingProfile.profile_picture && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Current profile picture:</p>
                <img
                  src={existingProfile.profile_picture}
                  alt="Profile"
                  className="mt-1 h-32 w-32 rounded-full object-cover border"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {existingProfile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfileForm;