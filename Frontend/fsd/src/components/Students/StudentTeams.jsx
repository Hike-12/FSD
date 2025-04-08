import React, { useEffect, useState } from "react";
import { DJANGO_BASE_URL } from "@/lib/utils";

const StudentTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
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
          console.error(data.error);
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = (teamId) => {
    window.location.href = `/team/${teamId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex justify-center items-center">
        <div className="animate-pulse text-teal-400">Loading your teams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-teal-400 mb-6 border-b border-teal-400 pb-2">
          My Teams
        </h2>
        
        {teams.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <p className="text-gray-300">You are not part of any teams yet.</p>
            <button 
              onClick={() => window.location.href = '/student/join-team'}
              className="mt-4 bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded transition duration-200"
            >
              Join a Team
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <div 
                key={team.team_id} 
                onClick={() => handleTeamClick(team.team_id)}
                className="bg-gray-800 rounded-lg p-6 shadow-lg cursor-pointer hover:border-teal-400 border border-gray-700 transition duration-200 hover:shadow-teal-500/10"
              >
                <h3 className="text-xl font-semibold text-teal-400 mb-2">{team.team_name}</h3>
                <p className="text-gray-400 mb-3">{team.competition_name}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Members: {team.member_count || 0}</span>
                  <span className="text-teal-400">Click to view details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTeams;