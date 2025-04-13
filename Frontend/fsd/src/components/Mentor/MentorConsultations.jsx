import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DJANGO_BASE_URL } from "@/lib/utils";

const MentorConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/get-consultations/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch consultations");

        const data = await response.json();
        console.log("Fetched consultations:", data);
        setConsultations(data.consultations);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      }
    };

    fetchConsultations();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Consultations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultations.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
          >
            <h3 className="text-lg font-medium text-gray-800">{consultation.from_student}</h3>
            <p className="text-sm text-gray-500">Mentor: {consultation.to_mentor}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => navigate(`/chat/${consultation.team_id}`)}
            >
              Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorConsultations;