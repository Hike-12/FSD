import React, { useState, useEffect } from "react";
import DJANGO_BASE_URL from "../utils";

const HostProfileForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const fetchHostProfile = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/hosts/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            full_name: data.full_name || "",
            email: data.email || "",
            contact_number: data.contact_number || "",
          });
        } else {
          console.log("No existing profile found.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHostProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    setErrors({});

    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/hosts/profile/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitMessage("Profile updated successfully!");
      } else {
        setErrors(data);
      }
    } catch (error) {
      setSubmitMessage("An error occurred. Please try again.");
      console.error("Error submitting profile:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Host Profile</h2>

      {submitMessage && <p className="text-green-600">{submitMessage}</p>}
      {errors.error && <p className="text-red-600">{errors.error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Contact Number</label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default HostProfileForm;
