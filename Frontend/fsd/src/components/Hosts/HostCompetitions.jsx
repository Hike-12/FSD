import React, { useEffect, useState } from "react";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const HostCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/hosts/get-host-competitions/`, {
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
      <h2 className="text-2xl font-bold mb-4">Competitions You've Created</h2>
      {competitions.length === 0 ? (
        <p>You haven't created any competitions yet.</p>
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

export default HostCompetitions;