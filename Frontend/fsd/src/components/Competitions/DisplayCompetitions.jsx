import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const CompetitionsList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/competitions/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch competitions");

        const data = await response.json();
        console.log("Competitions Data:", data);
        setCompetitions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  if (loading) return <p>Loading competitions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Competitions List</h2>
      {competitions.length === 0 ? (
        <p>No competitions available.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              {competitions.competition_picture && (
    <img src={competitions.competition_picture} alt={competitions.name} className="h-40 w-full object-cover rounded-t-lg" />
)}
              <th className="border p-2">Start Date</th>
              <th className="border p-2">End Date</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((comp) => (
              <tr key={comp.id} className="border">
                <td className="border p-2">{comp.name}</td>
                <td className="border p-2">{comp.start_date}</td>
                <td className="border p-2">{comp.end_date}</td>
                <td className="border p-2">
                  <Link
                    to={`/competitions/${comp.id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    View More
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CompetitionsList;
