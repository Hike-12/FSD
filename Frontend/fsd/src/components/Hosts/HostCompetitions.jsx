import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, Award, Users, Clock } from "lucide-react";
import { DJANGO_BASE_URL } from "@/lib/utils";

const HostCompetitions = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    upcoming: 0,
    completed: 0
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
        const comps = data.competitions.map((comp) => ({
          ...comp,
          start_date: new Date(comp.start_date),
          end_date: new Date(comp.end_date),
        }));
        
        setCompetitions(comps);
        
        // Calculate stats
        const now = new Date();
        setStats({
          active: comps.filter(c => now >= c.start_date && now <= c.end_date).length,
          upcoming: comps.filter(c => now < c.start_date).length,
          completed: comps.filter(c => now > c.end_date).length
        });
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
    navigate(`/admin-competitions/${competitionId}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-4"></div>
          <p className="text-teal-400 font-medium">Loading your competitions...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 p-4">
        <div className="border border-red-500/50 p-6 rounded-xl bg-gray-800 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-red-400 font-medium">Error: {error}</p>
          <button 
            className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all transform hover:scale-[1.02]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      {/* Animated Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-700 rounded-xl shadow-xl p-6 mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-600/20 rounded-lg">
              <Calendar className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                Competition Dashboard
              </h1>
              <p className="text-gray-300 mt-1">
                Manage all your hosted competitions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/30 transition-all transform hover:-translate-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600/20 rounded-lg">
              <Award className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/30 transition-all transform hover:-translate-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-700/30 transition-all transform hover:-translate-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Calendar Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-teal-500/10 transition-all">
          <div className="p-5 border-b border-gray-700 bg-gray-700/30">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={goToPreviousMonth} 
                className="p-2 rounded-full hover:bg-gray-700 transition-all text-teal-400 hover:text-teal-300 hover:rotate-[-5deg]"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h3 className="text-xl font-medium text-white bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button 
                onClick={goToNextMonth} 
                className="p-2 rounded-full hover:bg-gray-700 transition-all text-teal-400 hover:text-teal-300 hover:rotate-[5deg]"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div key={day} className="text-center py-2 text-sm font-medium text-teal-300">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-1 border rounded-lg transition-all hover:shadow-md ${
                    !day.isCurrentMonth ? "bg-gray-900/20 text-gray-500 border-gray-700" 
                    : "bg-gray-800/50 text-white border-gray-700 hover:bg-gray-700/30 hover:border-teal-400/30"
                  } ${
                    day.date?.toDateString() === new Date().toDateString()
                      ? "ring-2 ring-teal-500 bg-teal-900/20"
                      : ""
                  }`}
                >
                  {day.date && (
                    <>
                      <div className="text-right text-sm p-1 font-medium">
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {day.competitions?.slice(0, 2).map((comp) => (
                          <div
                            key={comp.id}
                            onClick={() => handleCompetitionClick(comp.id)}
                            className={`text-xs p-1 rounded truncate cursor-pointer transition-all transform hover:scale-[1.02] ${
                              day.date.toDateString() === comp.start_date.toDateString()
                                ? "bg-teal-600 text-white shadow-teal-500/30"
                                : "bg-teal-900/70 text-teal-100 hover:bg-teal-800/70"
                            }`}
                            title={comp.name}
                          >
                            {comp.name}
                          </div>
                        ))}
                        {day.competitions?.length > 2 && (
                          <div className="text-xs text-gray-400 text-center hover:text-teal-300 transition-colors">
                            +{day.competitions.length - 2} more
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

        {/* Competitions List Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-blue-500/10 transition-all">
          <div className="p-5 border-b border-gray-700 bg-gray-700/30">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Award className="h-5 w-5 mr-2 text-teal-400" />
              Your Competitions
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {competitions.length} competition{competitions.length !== 1 ? 's' : ''} hosted
            </p>
          </div>
          
          <div className="p-4">
            {competitions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400">No competitions available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {competitions.map((competition) => {
                  const now = new Date();
                  const status = 
                    now < competition.start_date ? 'upcoming' :
                    now > competition.end_date ? 'completed' : 'active';
                  
                  const statusColors = {
                    active: 'bg-teal-600/20 text-teal-400',
                    upcoming: 'bg-blue-600/20 text-blue-400',
                    completed: 'bg-purple-600/20 text-purple-400'
                  };

                  return (
                    <div
                      key={competition.id}
                      onClick={() => handleCompetitionClick(competition.id)}
                      className="group p-4 border border-gray-700 rounded-lg hover:bg-gray-700/30 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white group-hover:text-teal-300 transition-colors">
                            {competition.name}
                          </h3>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-teal-300 transition-colors mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostCompetitions;