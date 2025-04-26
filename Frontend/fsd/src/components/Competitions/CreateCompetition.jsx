"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';
import { 
  FiCalendar, 
  FiUsers, 
  FiAward, 
  FiLink, 
  FiMapPin, 
  FiImage, 
  FiInfo, 
  FiChevronRight, 
  FiChevronLeft,
  FiX,
  FiCheck,
  FiPlus,
  FiMinus
} from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

// const DJANGO_BASE_URL = "http://127.0.0.1:8000";
import {DJANGO_BASE_URL} from "@/lib/utils";

const CreateCompetition = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    competition_type_id: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    min_team_size: 1,
    max_team_size: 5,
    status: "upcoming",
    organizer: "",
    venue: "",
    website: "",
    required_skill_ids: [],
    competition_picture: null,
    prize: "",
    rules: ""
  });

  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [previewImage, setPreviewImage] = useState(null);
  const [progress, setProgress] = useState(20);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchSkill, setSearchSkill] = useState("");

  const tabs = ['basic', 'schedule', 'team', 'details'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [compTypesRes, skillsRes] = await Promise.all([
          fetch(`${DJANGO_BASE_URL}/api/competition-types/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
            credentials: "include",
          }),
          fetch(`${DJANGO_BASE_URL}/api/skills/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
            credentials: "include",
          })
        ]);
  
        if (!compTypesRes.ok || !skillsRes.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const compTypesData = await compTypesRes.json();
        const skillsData = await skillsRes.json();
        setCompetitionTypes(Array.isArray(compTypesData.competition_types) ? compTypesData.competition_types : []);
        setSkills(Array.isArray(skillsData.skills) ? skillsData.skills : []);
      } catch (error) {
        toast.error("Failed to load competition data");
        console.error("Error fetching dropdown data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const progressValues = {
      'basic': 20,
      'schedule': 45,
      'team': 70,
      'details': 100
    };
    setProgress(progressValues[activeTab]);
  }, [activeTab]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(compressedFile);
      
      setFormData(prev => ({ ...prev, competition_picture: compressedFile }));
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to process image");
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: date ? date.toISOString().split('T')[0] : "" 
    }));
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
      
      setFormData(prevForm => ({ 
        ...prevForm, 
        required_skill_ids: newSkills 
      }));
      
      return newSkills;
    });
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchSkill.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const formDataToSend = new FormData();
    
    for (const key in formData) {
      if (key === "required_skill_ids") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }
  
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/competitions/create/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        credentials: "include",
        body: formDataToSend,
      });
  
      if (response.ok) {
        toast.success("Competition created successfully!");
        navigate('/admin-competitions');
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        toast.error(errorData.message || "Failed to create competition");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("An error occurred while submitting");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBasicInfoTab = () => (
    <div className="space-y-6">
      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Competition Name *</label>
        <input 
          type="text" 
          name="name" 
          placeholder="Enter competition name" 
          value={formData.name} 
          onChange={handleChange} 
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
          required 
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Competition Type *</label>
        <select 
          name="competition_type_id" 
          value={formData.competition_type_id} 
          onChange={handleChange} 
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
          required
        >
          <option value="" className="text-gray-500">Select Competition Type</option>
          {competitionTypes.map((ct) => (
            <option key={ct.id} value={ct.id} className="text-white">{ct.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Description *</label>
        <textarea 
          name="description" 
          placeholder="Provide detailed description of the competition" 
          value={formData.description} 
          onChange={handleChange} 
          rows="5"
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
          required 
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Competition Image</label>
        <div className="flex items-center space-x-4">
          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors group">
            <div className="flex flex-col items-center justify-center">
              <FiImage className="w-8 h-8 text-gray-500 mb-2 group-hover:text-teal-400 transition-colors" />
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Click to upload image</p>
              <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
            </div>
            <input 
              type="file" 
              name="competition_picture" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden"
            />
          </label>
          {previewImage && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-700 group">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setFormData(prev => ({ ...prev, competition_picture: null }));
                }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="text-white text-xl" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
            <FiCalendar className="mr-2 text-teal-400" /> Start Date *
          </label>
          <DatePicker
            selected={formData.start_date ? new Date(formData.start_date) : null}
            onChange={(date) => handleDateChange(date, 'start_date')}
            selectsStart
            startDate={formData.start_date ? new Date(formData.start_date) : null}
            endDate={formData.end_date ? new Date(formData.end_date) : null}
            minDate={new Date()}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
            required
            popperClassName="dark-theme-datepicker"
            calendarClassName="dark-theme-datepicker"
            wrapperClassName="w-full"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
            <FiCalendar className="mr-2 text-teal-400" /> End Date *
          </label>
          <DatePicker
            selected={formData.end_date ? new Date(formData.end_date) : null}
            onChange={(date) => handleDateChange(date, 'end_date')}
            selectsEnd
            startDate={formData.start_date ? new Date(formData.start_date) : null}
            endDate={formData.end_date ? new Date(formData.end_date) : null}
            minDate={formData.start_date ? new Date(formData.start_date) : new Date()}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
            required
            popperClassName="dark-theme-datepicker"
            calendarClassName="dark-theme-datepicker"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
          <FiCalendar className="mr-2 text-teal-400" /> Registration Deadline * 
          <span className="ml-2 text-xs text-gray-400">(Select a date)</span>
        </label>
        <div className="relative">
          <DatePicker
            selected={formData.registration_deadline ? new Date(formData.registration_deadline) : null}
            onChange={(date) => handleDateChange(date, 'registration_deadline')}
            minDate={new Date()}
            // Removed maxDate constraint completely
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white cursor-pointer"
            required
            popperClassName="dark-theme-datepicker"
            calendarClassName="dark-theme-datepicker"
            wrapperClassName="w-full"
            popperPlacement="bottom-start"
            dateFormat="yyyy-MM-dd"
            placeholderText="Click to select date"
            showPopperArrow={true}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FiCalendar className="text-teal-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
            <FiUsers className="mr-2 text-teal-400" /> Min Team Size *
          </label>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, min_team_size: Math.max(1, prev.min_team_size - 1) }))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
              disabled={formData.min_team_size <= 1}
            >
              <FiMinus />
            </button>
            <input 
              type="number" 
              name="min_team_size" 
              min="1"
              value={formData.min_team_size} 
              onChange={handleChange} 
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white text-center"
              required 
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, min_team_size: prev.min_team_size + 1 }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
            <FiUsers className="mr-2 text-teal-400" /> Max Team Size *
          </label>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, max_team_size: Math.max(prev.min_team_size, prev.max_team_size - 1) }))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
              disabled={formData.max_team_size <= formData.min_team_size}
            >
              <FiMinus />
            </button>
            <input 
              type="number" 
              name="max_team_size" 
              min={formData.min_team_size}
              value={formData.max_team_size} 
              onChange={handleChange} 
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white text-center"
              required 
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, max_team_size: prev.max_team_size + 1 }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
          <FiAward className="mr-2 text-teal-400" /> Required Skills
        </label>
        
        {/* Selected Skills Chips */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map(skillId => {
              const skill = skills.find(s => s.id === skillId);
              return skill ? (
                <div 
                  key={skillId} 
                  className="flex items-center bg-teal-900/50 text-teal-100 px-3 py-1 rounded-full text-sm border border-teal-800"
                >
                  {skill.name}
                  <button 
                    type="button"
                    onClick={() => toggleSkill(skillId)}
                    className="ml-2 text-teal-300 hover:text-white transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Skills Search and Selection */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white mb-2 placeholder-gray-500"
          />
          
          <div className="max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
            {filteredSkills.length > 0 ? (
              filteredSkills.map(skill => (
                <div 
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-3 hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors ${
                    selectedSkills.includes(skill.id) ? 'bg-teal-900/30 border-l-4 border-l-teal-500' : ''
                  }`}
                >
                  <span className="text-gray-200">{skill.name}</span>
                  {selectedSkills.includes(skill.id) && <FiCheck className="text-teal-400" />}
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">No skills found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-6">
      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
          <FiMapPin className="mr-2 text-teal-400" /> Venue
        </label>
        <input 
          type="text" 
          name="venue" 
          placeholder="Physical location or online platform" 
          value={formData.venue} 
          onChange={handleChange} 
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2 flex items-center">
          <FiLink className="mr-2 text-teal-400" /> Website URL
        </label>
        <input 
          type="url" 
          name="website" 
          placeholder="https://example.com" 
          value={formData.website} 
          onChange={handleChange} 
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Organizer *</label>
        <input 
          type="text" 
          name="organizer" 
          placeholder="Organization or company name" 
          value={formData.organizer} 
          onChange={handleChange} 
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
          required 
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Prize Information</label>
        <input 
          type="text" 
          name="prize" 
          placeholder="E.g., $10,000 cash prize, Internship opportunities" 
          value={formData.prize} 
          onChange={handleChange} 
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-teal-300 mb-2">Competition Rules</label>
        <textarea 
          name="rules" 
          placeholder="Detailed rules and guidelines for participants" 
          value={formData.rules} 
          onChange={handleChange} 
          rows="6"
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white placeholder-gray-500"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-800">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white font-sans">Create New Competition</h2>
                <p className="text-gray-400 mt-1 font-sans">Fill in the details to create a new competition</p>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full mt-4 md:mt-0 border border-gray-700">
                <FiInfo className="text-teal-400" />
                <span className="text-sm text-gray-300 font-sans">All fields marked with * are required</span>
              </div>
            </div>

            {/* Progress Bar with Animation */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300 font-sans">Progress</span>
                <span className="text-sm font-medium text-teal-400 font-sans">{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Tabs Navigation with Indicator */}
            <div className="mb-8 relative">
              <nav className="flex space-x-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-3 font-medium text-sm relative whitespace-nowrap font-sans",
                      activeTab === tab 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-gray-300'
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 'basic' && renderBasicInfoTab()}
              {activeTab === 'schedule' && renderScheduleTab()}
              {activeTab === 'team' && renderTeamTab()}
              {activeTab === 'details' && renderDetailsTab()}

              <div className="mt-10 pt-6 border-t border-gray-800 flex justify-between">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) - 1])}
                    className="flex items-center px-6 py-3 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <FiChevronLeft className="mr-2" /> Previous
                  </button>
                )}
                <div className="ml-auto">
                  {activeTab !== 'details' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) + 1])}
                      className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:scale-[1.02]"
                    >
                      Next <FiChevronRight className="ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : 'Create Competition'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dark Theme Datepicker CSS */}
      <style jsx global>{`
        .dark-theme-datepicker {
          background-color: #111827;
          color: #f3f4f6;
          border-color: #1f2937;
        }
        .dark-theme-datepicker .react-datepicker__header {
          background-color: #0f172a;
          border-bottom-color: #1f2937;
        }
        .dark-theme-datepicker .react-datepicker__current-month,
        .dark-theme-datepicker .react-datepicker__day-name,
        .dark-theme-datepicker .react-datepicker__day {
          color: #f3f4f6;
        }
        .dark-theme-datepicker .react-datepicker__day:hover {
          background-color: #1e293b;
        }
        .dark-theme-datepicker .react-datepicker__day--selected {
          background-color: #0d9488;
          color: white;
        }
        .dark-theme-datepicker .react-datepicker__day--keyboard-selected {
          background-color: #0f766e;
          color: white;
        }
        .dark-theme-datepicker .react-datepicker__time-container {
          border-left-color: #1f2937;
        }
        .dark-theme-datepicker .react-datepicker__time-box {
          background-color: #111827;
        }
        .dark-theme-datepicker .react-datepicker__time-list-item:hover {
          background-color: #1e293b;
        }
        .dark-theme-datepicker .react-datepicker__time-list-item--selected {
          background-color: #0d9488;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CreateCompetition;