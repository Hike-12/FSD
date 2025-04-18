import React, { useEffect, useState } from "react";
import { DJANGO_BASE_URL } from "@/lib/utils";
import { Trophy, Calendar, Users, Award, Clock, ChevronRight } from "lucide-react";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const StudentCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(
          `${DJANGO_BASE_URL}/api/student/get-student-competitions/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );

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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500">
      Error: {error}
    </div>
  );

  return (
    <div className="bg-[#050A15] min-h-screen p-6">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-blue-400" />
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
          Your Competitions
        </h2>
      </div>

      {competitions.length === 0 ? (
        <div className="bg-blue-900/20 rounded-xl p-8 border border-blue-500/30 backdrop-blur-sm max-w-2xl mx-auto text-center">
          <p className="text-blue-100/80 text-lg">
            You haven't joined any competitions yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <div 
              key={competition.id}
              className="bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{competition.name}</h3>
                {competition.is_winner && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                    <Award className="h-3 w-3" /> Winner
                  </span>
                )}
              </div>

              <p className="text-blue-100/80 mb-5 line-clamp-2">{competition.description}</p>

              <div className="space-y-3 text-sm text-blue-200/80 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{competition.participants_count} participants</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {competition.days_remaining > 0
                      ? `${competition.days_remaining} days remaining`
                      : "Competition ended"}
                  </span>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              {competition.progress_percentage !== undefined && (
                <div className="mt-auto">
                  <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, competition.progress_percentage))}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-300">
                      {competition.progress_percentage}% completed
                    </span>
                    <ChevronRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCompetitions;