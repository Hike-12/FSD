import React, { useEffect, useState } from "react";

import DJANGO_BASE_URL from "@/lib/utils";

const StudentTeams = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch(`${DJANGO_BASE_URL}/api/student/get-student-teams/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setTeams(data.teams);
      } else {
        alert(data.error);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Teams</h2>
      {teams.length === 0 ? (
        <p>You are not part of any teams yet.</p>
      ) : (
        <ul>
          {teams.map((team) => (
            <li key={team.team_id} className="mb-2">
              <strong>{team.team_name}</strong> - {team.competition_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentTeams;