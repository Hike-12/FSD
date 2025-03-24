import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [existingProfile, setExistingProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { id: 0, label: 'Personal Info' },
    { id: 1, label: 'Professional Info' },
    { id: 2, label: 'Social Media' },
    { id: 3, label: 'Availability' },
    { id: 4, label: 'Profile' }
  ];
  
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    address: '',
    country: '',
    state: '',
    city: '',
    
    // Professional Info
    company: '',
    position: '',
    experience: '',
    skills: [],
    competitionTypes: [],
    
    // Social Media
    linkedin: '',
    twitter: '',
    github: '',
    website: '',
    
    // Availability
    availableDays: [],
    availableHours: '',
    timezone: '',
    
    // Profile
    bio: '',
    profileImage: ''
  });

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      try {
        // Simulated API calls
        // In a real application, these would be actual API calls
        setTimeout(() => {
          setSkills(['JavaScript', 'React', 'Node.js', 'Python', 'Data Science', 'Machine Learning']);
          setCompetitionTypes(['Hackathon', 'Coding Challenge', 'Design Competition', 'Research Contest']);
          setExistingProfile(null); // Set to null for new profile creation
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // If existing profile data is loaded, populate the form
    if (existingProfile) {
      setFormData({
        ...formData,
        ...existingProfile
      });
    }
  }, [existingProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setFormData(prevData => ({
        ...prevData,
        availableDays: [...prevData.availableDays, name]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        availableDays: prevData.availableDays.filter(day => day !== name)
      }));
    }
  };

  const handleSkillsChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData(prevData => ({
        ...prevData,
        skills: [...prevData.skills, value]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        skills: prevData.skills.filter(skill => skill !== value)
      }));
    }
  };

  const handleCompetitionTypesChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData(prevData => ({
        ...prevData,
        competitionTypes: [...prevData.competitionTypes, value]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        competitionTypes: prevData.competitionTypes.filter(type => type !== value)
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Original form data object:", formData);
    setErrors({});
    setSubmitMessage("");
  
    try {
      const formDataToSend = new FormData();
  
      // Append simple string/number fields
      formDataToSend.append("full_name", formData.full_name);
      formDataToSend.append("date_of_birth", formData.date_of_birth);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("postal_code", formData.postal_code);
      formDataToSend.append("mentor_type", formData.mentor_type);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("expertise", formData.expertise);
      formDataToSend.append("years_of_experience", formData.years_of_experience);
      formDataToSend.append("current_company", formData.current_company);
      formDataToSend.append("current_position", formData.current_position);
      formDataToSend.append("linkedin", formData.linkedin);
      formDataToSend.append("github", formData.github);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("certifications", formData.certifications);
      formDataToSend.append("achievements", formData.achievements);
      formDataToSend.append("languages_spoken", formData.languages_spoken);
      formDataToSend.append("availability_status", formData.availability_status);
      formDataToSend.append("available_days", formData.available_days);
      formDataToSend.append("available_times", formData.available_times);
      formDataToSend.append("max_teams", formData.max_teams);
  
      // Append arrays
      if (Array.isArray(formData.skill_ids)) {
        formData.skill_ids.forEach((id) => formDataToSend.append("skill_ids", id));
      }
  
      if (Array.isArray(formData.competition_type_ids)) {
        formData.competition_type_ids.forEach((id) =>
          formDataToSend.append("competition_type_ids", id)
        );
      }
  
      // Append file
      if (formData.profile_picture) {
        formDataToSend.append("profile_picture", formData.profile_picture);
      }
  
      // Debug: Show all FormData entries
      console.log("Final FormData entries:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      // Send request
      let response;
      if (existingProfile) {
        console.log(`Sending PUT request to /api/mentor-profiles/${existingProfile.id}/`);
  
        response = await fetch(`/api/mentor-profiles/${existingProfile.id}/`, {
          method: "POST", // Keeping original method
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            // Note: Do NOT set Content-Type header when sending FormData
          },
          credentials: "include",
          body: formDataToSend,
        });
      } else {
        console.log("Sending POST request to /api/mentor-profiles/create_or_update/");
        response = await fetch("/api/mentor-profiles/create_or_update/", {
          method: "POST",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
          body: formDataToSend,
        });
      }
  
      // Log response status
      console.log(`Response status: ${response.status}`);
      const responseText = await response.text();
      console.log("Raw response:", responseText);
  
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed response data:", responseData);
      } catch (e) {
        console.log("Could not parse response as JSON");
      }
  
      if (!response.ok) {
        throw { response: { data: responseData || responseText } };
      }
  
      setSubmitMessage(
        existingProfile ? "Profile updated successfully!" : "Profile created successfully!"
      );
  
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (loading) {
<<<<<<< HEAD
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
<div className="container mx-auto p-4 max-w-4xl bg-[#f7f6f1]">
  <h1 className="text-2xl font-bold mb-6 text-[#36454f]">
    {existingProfile ? 'Update Your Mentor Profile' : 'Create Your Mentor Profile'}
  </h1>
  
  {submitMessage && (
    <div className="bg-[#e8f0e8] border border-[#509c52] text-[#2b602d] px-4 py-3 rounded mb-4">
      {submitMessage}
=======
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#333333] border-t-[#d9d2b6] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#233d4d] font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }const renderForm = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#233d4d] border-b border-[#e1bb80] pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your address"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your country"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your state"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your city"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#233d4d] border-b border-[#e1bb80] pb-2">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Enter your position"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Years of experience"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Skills</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border-2 border-[#e1bb80] rounded-md bg-white">
                  {skills.map((skill) => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        value={skill}
                        checked={formData.skills.includes(skill)}
                        onChange={handleSkillsChange}
                        className="w-4 h-4 mr-2 accent-[#a39770]"
                      />
                      <label htmlFor={`skill-${skill}`} className="text-[#233d4d]">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Competition Types</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border-2 border-[#e1bb80] rounded-md bg-white">
                  {competitionTypes.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`competition-${type}`}
                        value={type}
                        checked={formData.competitionTypes.includes(type)}
                        onChange={handleCompetitionTypesChange}
                        className="w-4 h-4 mr-2 accent-[#a39770]"
                      />
                      <label htmlFor={`competition-${type}`} className="text-[#233d4d]">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#233d4d] border-b border-[#e1bb80] pb-2">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="LinkedIn profile URL"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Twitter profile URL"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="GitHub profile URL"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Personal Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Website URL"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#233d4d] border-b border-[#e1bb80] pb-2">Availability</h2>
            <div>
              <label className="block mb-2 text-sm font-medium text-[#233d4d]">Available Days</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-2 border-[#e1bb80] rounded-md bg-white">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      id={day}
                      name={day}
                      checked={formData.availableDays.includes(day)}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 mr-2 accent-[#a39770]"
                    />
                    <label htmlFor={day} className="text-[#233d4d]">{day}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Available Hours</label>
                <input
                  type="text"
                  name="availableHours"
                  value={formData.availableHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                >
                  <option value="">Select Timezone</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="UTC">Universal Time (UTC)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#233d4d] border-b border-[#e1bb80] pb-2">Profile</h2>
            <div>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Profile Image</label>
                <div className="flex items-center">
                  <div className="w-24 h-24 bg-white border-2 border-[#e1bb80] rounded-full flex items-center justify-center mr-4 overflow-hidden">
                    {formData.profileImage ? (
                      <span className="text-sm text-[#233d4d] font-medium">Image Selected</span>
                    ) : (
                      <span className="text-sm text-[#a39770]">No Image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    name="profileImage"
                    onChange={handleInputChange}
                    className="text-sm text-[#233d4d] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#e1bb80] file:text-[#233d4d] hover:file:bg-[#233d4d]"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#233d4d]">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-none rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#233d4d] focus:border-transparent"
                  placeholder="Write a short bio about yourself"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Mentor Profile Form</h1>
      
      <div className="bg-white border border-[#e1bb80] rounded-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#233d4d] text-white flex items-center justify-center rounded-full mr-2">{currentStep + 1}</div>
            <h2 className="text-lg font-semibold text-[#233d4d]">{steps[currentStep].label}</h2>
          </div>
          <div className="flex items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-4 py-2 mr-2 rounded-md ${currentStep === 0 ? 'bg-gray-200 text-gray-500' : 'bg-[#233d4d] text-white'}`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className={`px-4 py-2 rounded-md ${currentStep === steps.length - 1 ? 'bg-gray-200 text-gray-500' : 'bg-[#233d4d] text-white'}`}
            >
              Next
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-200 my-4 rounded-full">
        <div className="h-1 bg-[#e1bb80] rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        {renderForm()}
      </div>
      
      <button
        onClick={handleSubmit}
        className="w-full bg-[#e1bb80] text-[#233d4d] py-3 px-11 rounded-full text-xs font-bold uppercase tracking-wider transition duration-80 ease-in-out active:scale-95 focus:outline-none"
      >
        {currentStep === steps.length - 1 ? 'Submit' : 'Save & Continue'}
      </button>
      
      {submitMessage && <p className="text-[#233d4d] text-center mt-4">{submitMessage}</p>}
>>>>>>> 2cb75c5 (mentorProfile form edit kia color scheme baaki hai)
    </div>
  )}
  
  {errors.general && (
    <div className="bg-[#fdeded] border border-[#d97471] text-[#b13f3c] px-4 py-3 rounded mb-4">
      {errors.general}
    </div>
  )}
  
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Personal Information Section */}
    <div className="bg-[#f5f3e8] p-6 rounded-lg shadow-md border border-[#e6e2d3]">
      <h2 className="text-xl font-semibold mb-4 text-[#36454f]">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Full Name*</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            required
          />
          {errors.full_name && <p className="text-[#b13f3c] text-xs mt-1">{errors.full_name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
          {errors.date_of_birth && <p className="text-[#b13f3c] text-xs mt-1">{errors.date_of_birth}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Gender</label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
          {errors.phone_number && <p className="text-[#b13f3c] text-xs mt-1">{errors.phone_number}</p>}
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1 text-[#36454f]">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">State/Province</label>
          <input
            type="text"
            name="state"
            value={formData.state || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">City</label>
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
      </div>
    </div>
    
    {/* Professional Information Section */}
    <div className="bg-[#f5f3e8] p-6 rounded-lg shadow-md border border-[#e6e2d3]">
      <h2 className="text-xl font-semibold mb-4 text-[#36454f]">Professional Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Mentor Type*</label>
          <select
            name="mentor_type"
            value={formData.mentor_type || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            required
          >
            <option value="">Select Mentor Type</option>
            <option value="Technical">Technical</option>
            <option value="Business">Business</option>
            <option value="Industry Expert">Industry Expert</option>
            <option value="Academic">Academic</option>
            <option value="Career Coach">Career Coach</option>
          </select>
          {errors.mentor_type && <p className="text-[#b13f3c] text-xs mt-1">{errors.mentor_type}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Expertise*</label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            required
          />
          {errors.expertise && <p className="text-[#b13f3c] text-xs mt-1">{errors.expertise}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Years of Experience</label>
          <input
            type="number"
            name="years_of_experience"
            value={formData.years_of_experience || ''}
            onChange={handleChange}
            min="0"
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Current Company</label>
          <input
            type="text"
            name="current_company"
            value={formData.current_company || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Current Position</label>
          <input
            type="text"
            name="current_position"
            value={formData.current_position || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Skills</label>
          <select 
            name="skill_ids" 
            multiple 
            value={formData.skill_ids || []} 
            onChange={handleMultiSelectChange} 
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 h-32 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          >
            {Array.isArray(skills) && skills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
          <p className="text-xs text-[#5d5d5d] mt-1">Hold Ctrl/Cmd to select multiple skills</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Competition Types</label>
          <select
            name="competition_type_ids"
            multiple
            value={formData.competition_type_ids || ''}
            onChange={handleMultiSelectChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 h-32 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          >
            {Array.isArray(competitionTypes) && competitionTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <p className="text-xs text-[#5d5d5d] mt-1">Hold Ctrl/Cmd to select multiple types</p>
        </div>
      </div>
    </div>
    
    {/* Social & Bio Section */}
    <div className="bg-[#f5f3e8] p-6 rounded-lg shadow-md border border-[#e6e2d3]">
      <h2 className="text-xl font-semibold mb-4 text-[#36454f]">Social Media & Bio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">GitHub</label>
          <input
            type="url"
            name="github"
            value={formData.github || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="https://github.com/username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1 text-[#36454f]">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows="4"
          className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          placeholder="Tell us about yourself..."
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Certifications</label>
          <textarea
            name="certifications"
            value={formData.certifications || ''}
            onChange={handleChange}
            rows="3"
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="List your certifications..."
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Achievements</label>
          <textarea
            name="achievements"
            value={formData.achievements || ''}
            onChange={handleChange}
            rows="3"
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="List your achievements..."
          ></textarea>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1 text-[#36454f]">Languages Spoken</label>
        <input
          type="text"
          name="languages_spoken"
          value={formData.languages_spoken || ''}
          onChange={handleChange}
          className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          placeholder="English, Spanish, etc."
        />
      </div>
    </div>
    
    {/* Availability Section */}
    <div className="bg-[#f5f3e8] p-6 rounded-lg shadow-md border border-[#e6e2d3]">
      <h2 className="text-xl font-semibold mb-4 text-[#36454f]">Availability</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Availability Status</label>
          <select
            name="availability_status"
            value={formData.availability_status || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          >
            <option value="Available">Available</option>
            <option value="Limited Availability">Limited Availability</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Maximum Teams</label>
          <input
            type="number"
            name="max_teams"
            value={formData.max_teams || ''}
            onChange={handleChange}
            min="1"
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Available Days</label>
          <input
            type="text"
            name="available_days"
            value={formData.available_days || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="Mon, Wed, Fri"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[#36454f]">Available Times</label>
          <input
            type="text"
            name="available_times"
            value={formData.available_times || ''}
            onChange={handleChange}
            className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
            placeholder="6pm-9pm EST"
          />
        </div>
      </div>
    </div>
    
    {/* Profile Picture Section */}
    <div className="bg-[#f5f3e8] p-6 rounded-lg shadow-md border border-[#e6e2d3]">
      <h2 className="text-xl font-semibold mb-4 text-[#36454f]">Profile Picture</h2>
      <div>
        <label className="block text-sm font-medium mb-1 text-[#36454f]">Upload Profile Picture</label>
        <input
          type="file"
          name="profile_picture"
          onChange={handleFileChange}
          className="w-full border border-[#d6d1bc] rounded px-3 py-2 focus:ring-2 focus:ring-[#bfbaa6] focus:border-[#bfbaa6] bg-white"
          accept="image/*"
        />
        {existingProfile && existingProfile.profile_picture && (
          <div className="mt-2">
            <p className="text-sm text-[#5d5d5d]">Current profile picture:</p>
            <img
              src={existingProfile.profile_picture}
              alt="Profile"
              className="mt-1 h-32 w-32 rounded-full object-cover border border-[#d6d1bc]"
            />
          </div>
        )}
      </div>
    </div>
    
    {/* Submit Button */}
    <div className="flex justify-end">
      <button
        type="submit"
        className="bg-[#36454f] text-[#f5f3e8] px-6 py-2 rounded hover:bg-[#293741] focus:outline-none focus:ring-2 focus:ring-[#5a6e79] transition-colors duration-200"
      >
        {existingProfile ? 'Update Profile' : 'Create Profile'}
      </button>
    </div>
  </form>
</div>
  );
};
  export default MentorProfileForm;