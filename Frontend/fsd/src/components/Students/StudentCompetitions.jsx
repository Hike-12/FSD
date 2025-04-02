import React, { useEffect, useState } from "react";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const StudentCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/student/get-student-competitions/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch competitions");

        const data = await response.json();
        setCompetitions(data.competitions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Competitions You're Participating In</h2>
      {competitions.length === 0 ? (
        <p>You are not participating in any competitions yet.</p>
      ) : (
        <ul>
          {competitions.map((competition) => (
            <li key={competition.id}>
              <strong>{competition.name}</strong> - {competition.start_date} to {competition.end_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentCompetitions;