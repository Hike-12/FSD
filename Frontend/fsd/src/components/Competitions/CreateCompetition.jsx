import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const AdminCompetitionForm = () => {
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
    required_skill_ids: []
  });

  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
  
        // Ensure responses are OK
        if (!compTypesRes.ok || !skillsRes.ok) {
          throw new Error("Failed to fetch data");
        }
  
        // Parse JSON properly
        const compTypesData = await compTypesRes.json();
        const skillsData = await skillsRes.json();
        // Ensure the response is an array
        setCompetitionTypes(Array.isArray(compTypesData.competition_types) ? compTypesData.competition_types : []);
        setSkills(Array.isArray(skillsData.skills) ? skillsData.skills : []);
      } catch (error) {
        toast.error("Failed to load competition data");
        console.error("Error fetching dropdown data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/competitions/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Competition created successfully!");
        // Reset form
        setFormData({
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
        });
      } else {
        toast.error("Failed to create competition");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center">Create Competition</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          name="name" 
          placeholder="Competition Name" 
          value={formData.name} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
          required 
        />

        <select 
          name="competition_type_id" 
          value={formData.competition_type_id} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Competition Type</option>
          {competitionTypes.map((ct) => (
            <option key={ct.id} value={ct.id}>{ct.name}</option>
          ))}
        </select>

        <textarea 
          name="description" 
          placeholder="Description" 
          value={formData.description} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
          required 
        />

        <div className="grid grid-cols-2 gap-4">
          <input 
            type="date" 
            name="start_date" 
            value={formData.start_date} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
            required 
          />
          <input 
            type="date" 
            name="end_date" 
            value={formData.end_date} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
            required 
          />
        </div>

        <input 
          type="date" 
          name="registration_deadline" 
          value={formData.registration_deadline} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
          required 
        />

        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" 
            name="min_team_size" 
            value={formData.min_team_size} 
            onChange={handleChange} 
            placeholder="Min Team Size"
            className="w-full p-2 border rounded"
            required 
          />
          <input 
            type="number" 
            name="max_team_size" 
            value={formData.max_team_size} 
            onChange={handleChange} 
            placeholder="Max Team Size"
            className="w-full p-2 border rounded"
            required 
          />
        </div>

        <input 
          type="text" 
          name="organizer" 
          placeholder="Organizer" 
          value={formData.organizer} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
          required 
        />

        <input 
          type="text" 
          name="venue" 
          placeholder="Venue" 
          value={formData.venue} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
        />

        <input 
          type="url" 
          name="website" 
          placeholder="Website URL" 
          value={formData.website} 
          onChange={handleChange} 
          className="w-full p-2 border rounded"
        />

        <select 
          name="required_skill_ids" 
          multiple 
          onChange={handleMultiSelectChange}
          className="w-full p-2 border rounded"
        >
          {skills.map(skill => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>

        <button 
          type="submit" 
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Create Competition
        </button>
      </form>
    </div>
  );
};

export default AdminCompetitionForm;