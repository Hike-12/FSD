import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router DOM
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"; // Keep icons for better UI
import DJANGO_BASE_URL from "../../lib/utils";

const HostCompetitions = () => {
  const navigate = useNavigate(); // Use navigate for routing
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

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
        console.log("Fetched competitions:", data); // Debugging line
        setCompetitions(
          data.competitions.map((comp) => ({
            ...comp,
            start_date: new Date(comp.start_date),
            end_date: new Date(comp.end_date),
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth, competitions]);

  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startOffset = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startOffset; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, monthIndex, i);
      const competitionsForDay = competitions.filter(
        (comp) => date >= comp.start_date && date <= comp.end_date
      );

      days.push({
        date,
        isCurrentMonth: true,
        competitions: competitionsForDay,
      });
    }

    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleCompetitionClick = (competitionId) => {
    navigate(`/admin-competition/${competitionId}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );

  if (error)
    return (
      <div className="border border-red-400 p-4 rounded">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 p-4">
      <div className="border rounded-lg p-4 shadow">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2 h-6 w-6" />
            Your Competitions
          </h2>
          {competitions.length === 0 && (
            <span className="text-sm text-gray-500">No competitions created yet</span>
          )}
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-16 p-1 border rounded-lg ${
                  !day.isCurrentMonth ? "bg-gray-50 text-gray-300" : "bg-white"
                } ${
                  day.date?.toDateString() === new Date().toDateString()
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                {day.date && (
                  <>
                    <div className="text-right text-sm p-1">{day.date.getDate()}</div>
                    <div className="space-y-1">
                      {day.competitions?.slice(0, 3).map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => handleCompetitionClick(comp.id)}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${
                            day.date.toDateString() === comp.start_date.toDateString()
                              ? "bg-blue-500 text-white"
                              : "bg-blue-100 text-blue-800"
                          } hover:opacity-80`}
                          title={comp.name}
                        >
                          {comp.name}
                        </div>
                      ))}
                      {day.competitions?.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{day.competitions.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow">
        <h2 className="text-xl font-bold pb-4 border-b">All Competitions List</h2>
        {competitions.length === 0 ? (
          <p className="text-gray-500">You haven't created any competitions yet.</p>
        ) : (
          <div className="space-y-2">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                onClick={() => handleCompetitionClick(competition.id)}
                className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <h3 className="font-medium">{competition.name}</h3>
                  <p className="text-sm text-gray-500">
                    {competition.start_date.toLocaleDateString()} to{" "}
                    {competition.end_date.toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostCompetitions;