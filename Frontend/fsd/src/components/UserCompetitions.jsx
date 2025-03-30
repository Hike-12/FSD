import React, { useEffect, useState } from "react";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const UserCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const response = await fetch(`${DJANGO_BASE_URL}/api/user-competitions/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCompetitions(data.competitions);
      } else {
        alert(data.error);
      }
    };

    fetchCompetitions();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Competitions</h2>
      {competitions.length === 0 ? (
        <p>You are not part of any competitions yet.</p>
      ) : (
        <ul>
          {competitions.map((competition) => (
            <li key={competition.competition_id} className="mb-2">
              <strong>{competition.competition_name}</strong> - {competition.start_date} to {competition.end_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserCompetitions;