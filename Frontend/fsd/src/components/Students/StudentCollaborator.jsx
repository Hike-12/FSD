import React, { useEffect, useState } from "react";
import { DJANGO_BASE_URL } from "@/lib/utils";

const Collaborators = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/collaborators/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch collaborators");

        const data = await response.json();
        setCollaborators(data.collaborators);
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (collaborators.length === 0) {
    return <div>No collaborators found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Collaborators</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
          >
            <img
              src={collaborator.profile_picture || "/default-avatar.png"}
              alt={collaborator.full_name}
              className="w-20 h-20 rounded-full object-cover mb-4"
            />
            <h3 className="text-lg font-medium text-gray-800">{collaborator.full_name}</h3>
            <p className="text-sm text-gray-500">{collaborator.department}</p>
            <p className="text-sm text-gray-500">{collaborator.year_of_study} Year</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;