import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
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
    mentor_type: '',
    department: '',
    expertise: '',
    years_of_experience: '',
    current_company: '',
    current_position: '',
    skill_ids: [],
    competition_type_ids: [],
    linkedin: '',
    github: '',
    website: '',
    bio: '',
    certifications: '',
    achievements: '',
    languages_spoken: '',
    availability_status: 'Available',
    available_days: '',
    available_times: '',
    max_teams: 1,
    profile_picture: null
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const getAccessToken = () => localStorage.getItem('access');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
    
        // Get CSRF token
        await fetch('csrf/', { credentials: 'include' });
        console.log('CSRF token fetched successfully');
    
        // Fetch skills
        try {
          const skillsResponse = await fetch('/api/skills/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
             },
            credentials: 'include',
          });
          const skillsData = await skillsResponse.json();
          setSkills(skillsData);
          console.log('Skills fetched successfully');
        } catch (error) {
          console.error('Error fetching skills data:', error);
          setErrors({ general: 'Failed to load skills. Please try again later.' });
        }
    
        // Fetch competition types
        try {
          const competitionTypesResponse = await fetch('http://localhost:8000/api/competition-types/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
             },
            credentials: 'include',
          });
          const competitionTypesData = await competitionTypesResponse.json();
          setCompetitionTypes(competitionTypesData);
          console.log('Competition types fetched successfully');
        } catch (error) {
          console.error('Error fetching competition types data:', error);
          setErrors({ general: 'Failed to load competition types.' });
        }
    
        // Fetch existing profile
        try {
          const profileResponse = await fetch('http://localhost:8000/api/mentor-profiles/my_profile/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
             },
            credentials: 'include',
          });
    
          if (!profileResponse.ok) throw new Error('No profile found');
    
          const profileData = await profileResponse.json();
          setExistingProfile(profileData);
    
          // Pre-fill form...
          setFormData({
            ...formData,
            ...profileData,
            skill_ids: profileData.skills.map(skill => skill.id) || [],
            competition_type_ids: profileData.competition_types.map(type => type.id) || [],
            profile_picture: null,
          });
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

  const getCsrfToken = async () => {
    const response = await fetch('csrf/');
    const data = await response.json();
    return data.csrfToken; // Assuming the token is returned in this format
  };

  const handleSubmit = async (e) => {
    console.log('Form data:', formData);
    e.preventDefault();
    setErrors({});
    setSubmitMessage('');
  
    try {
  
      const formDataToSend = new FormData();

Object.keys(formData).forEach(key => {
  // Handle arrays specifically
  if ((key === 'skill_ids' || key === 'competition_type_ids') && Array.isArray(formData[key])) {
    if (formData[key].length > 0) {
      formData[key].forEach(id => formDataToSend.append(key, id));
    }
  } 
  // Handle file upload
  else if (key === 'profile_picture' && formData[key]) {
    formDataToSend.append(key, formData[key]);
  } 
  // Handle all other fields that aren't null
  else if (formData[key] !== null) {
    formDataToSend.append(key, formData[key].toString());
  }
});

// Debug: Log what's actually in the FormData
console.log("FormData entries:");
for (let [key, value] of formDataToSend.entries()) {
  console.log(`${key}: ${value}`);
}
      
      let response;
      console.log('Form data to send:', existingProfile ? 'PUT' : 'POST', formDataToSend);
      if (existingProfile) {
        response = await fetch(`/api/mentor-profiles/${existingProfile.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
          body: formDataToSend,
        });
      } else {
        response = await fetch('/api/mentor-profiles/create_or_update/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
          body: formDataToSend,
        });
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw { response: { data: errorData } };
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
        {existingProfile ? 'Update Your Mentor Profile' : 'Create Your Mentor Profile'}
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
                value={formData.full_name}
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
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
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
                value={formData.phone_number}
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
              value={formData.address}
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
                value={formData.country}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">State/Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {/* Professional Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mentor Type*</label>
              <select
                name="mentor_type"
                value={formData.mentor_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select Mentor Type</option>
                <option value="Technical">Technical</option>
                <option value="Business">Business</option>
                <option value="Industry Expert">Industry Expert</option>
                <option value="Academic">Academic</option>
                <option value="Career Coach">Career Coach</option>
              </select>
              {errors.mentor_type && <p className="text-red-500 text-xs mt-1">{errors.mentor_type}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expertise*</label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              {errors.expertise && <p className="text-red-500 text-xs mt-1">{errors.expertise}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Current Company</label>
              <input
                type="text"
                name="current_company"
                value={formData.current_company}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Current Position</label>
              <input
                type="text"
                name="current_position"
                value={formData.current_position}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <select
                name="skill_ids"
                multiple
                value={formData.skill_ids}
                onChange={handleMultiSelectChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
              >
                {Array.isArray(skills) && skills.map(skill => (
    <div key={skill}>{skill}</div>
))}

              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Competition Types</label>
              <select
                name="competition_type_ids"
                multiple
                value={formData.competition_type_ids}
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
        </div>
        
        {/* Social & Bio Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Social Media & Bio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
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
                value={formData.github}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Certifications</label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your certifications..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Achievements</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="List your achievements..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Languages Spoken</label>
            <input
              type="text"
              name="languages_spoken"
              value={formData.languages_spoken}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="English, Spanish, etc."
            />
          </div>
        </div>
        
        {/* Availability Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Availability Status</label>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Available">Available</option>
                <option value="Limited Availability">Limited Availability</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Teams</label>
              <input
                type="number"
                name="max_teams"
                value={formData.max_teams}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Available Days</label>
              <input
                type="text"
                name="available_days"
                value={formData.available_days}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Mon, Wed, Fri"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Available Times</label>
              <input
                type="text"
                name="available_times"
                value={formData.available_times}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="6pm-9pm EST"
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
                <p className="text-sm text-gray-500">Current profile picture: {existingProfile.profile_picture.split('/').pop()}</p>
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

export default MentorProfileForm;