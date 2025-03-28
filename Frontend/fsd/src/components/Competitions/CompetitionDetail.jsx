import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/competitions/${id}/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch competition details");

        const data = await response.json();
        console.log("Competition Details:", data);
        setCompetition(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id]);

  if (loading) return <p>Loading competition details...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-500 text-white rounded mb-4">
        Back
      </button>
      <h2 className="text-3xl font-bold">{competition.name}</h2>
      {competition.competition_picture && (
    <img src={competition.competition_picture} alt="Competition" className="w-full h-auto rounded-lg shadow-md" />
)}
      <p><strong>Type:</strong> {competition.competition_type_name}</p>
      <p><strong>Description:</strong> {competition.description}</p>
      <p><strong>Start Date:</strong> {competition.start_date}</p>
      <p><strong>End Date:</strong> {competition.end_date}</p>
      <p><strong>Registration Deadline:</strong> {competition.registration_deadline}</p>
      <p><strong>Team Size:</strong> {competition.min_team_size} - {competition.max_team_size}</p>
      <p><strong>Status:</strong> {competition.status}</p>
      <p><strong>Organizer:</strong> {competition.organizer}</p>
      <p><strong>Venue:</strong> {competition.venue}</p>
      <p><strong>Website:</strong> 
        {competition.website ? (
          <a href={competition.website} target="_blank" rel="noopener noreferrer" className="text-blue-500"> Visit</a>
        ) : " N/A"}
      </p>
    </div>
  );
};

export default CompetitionDetail;
