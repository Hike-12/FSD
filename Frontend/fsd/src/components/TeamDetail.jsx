import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch team details");

        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) return <p>Loading team details...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{team.name}</h2>
      <p><strong>Competition:</strong> {team.competition_name}</p>
      <p><strong>Description:</strong> {team.competition_description}</p>
      <p><strong>Start Date:</strong> {team.competition_start_date}</p>
      <p><strong>End Date:</strong> {team.competition_end_date}</p>
      <p><strong>Registration Deadline:</strong> {team.competition_registration_deadline}</p>
      <p><strong>Team Size:</strong> {team.competition_min_team_size} - {team.competition_max_team_size}</p>
      <p><strong>Organizer:</strong> {team.competition_organizer}</p>
      <p><strong>Venue:</strong> {team.competition_venue}</p>
      <p><strong>Website:</strong> 
        {team.competition_website ? (
          <a href={team.competition_website} target="_blank" rel="noopener noreferrer" className="text-blue-500"> Visit</a>
        ) : " N/A"}
      </p>
      <p><strong>Team Code:</strong> {team.team_code}</p>
      <p><strong>Status:</strong> {team.status}</p>
      <p><strong>Members:</strong></p>
      <ul>
        {team.members.map((member) => (
          <li key={member.id}>{member.full_name} ({member.role})</li>
        ))}
      </ul>
    </div>
  );
};

export default TeamDetail;