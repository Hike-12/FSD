import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState(""); // Updated to use teamCode instead of teamId

  const handleCreateTeam = async () => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/create-team/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ competition_id: id, team_name: teamName }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Team created successfully! Team Code: ${data.team_code}`);
        navigate(`/team/${data.team_id}`); // Redirect to the team page
      } else {
        alert(data.error || "Failed to create team");
      }
    } catch (err) {
      alert("An error occurred while creating the team. Please try again.");
    }
  };

  const handleJoinTeam = async () => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/join-team/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ team_code: teamCode }), // Use team_code instead of teamId
      });

      const data = await response.json();
      if (response.ok) {
        alert("Successfully joined the team!");
        navigate(`/team/${data.team_id}`);
      } else {
        alert(data.error || "Failed to join the team");
      }
    } catch (err) {
      alert("An error occurred while joining the team. Please try again.");
    }
  };

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

      {/* Create Team Section */}
      <div>
        <h3 className="text-xl font-bold mt-6">Create a Team</h3>
        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border p-2 rounded w-full mt-2"
        />
        <button onClick={handleCreateTeam} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Create Team
        </button>
      </div>

      {/* Join Team Section */}
      <div>
        <h3 className="text-xl font-bold mt-6">Join a Team</h3>
        <input
          type="text"
          placeholder="Enter Team Code"
          value={teamCode} // Updated to use teamCode
          onChange={(e) => setTeamCode(e.target.value)} // Updated to set teamCode
          className="border p-2 rounded w-full mt-2"
        />
        <button onClick={handleJoinTeam} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
          Join Team
        </button>
      </div>
    </div>
  );
};

export default CompetitionDetail;