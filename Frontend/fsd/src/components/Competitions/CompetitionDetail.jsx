"use client";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Trophy, Users, Calendar, MapPin, Globe, PlusCircle, LogIn } from "lucide-react";

const DJANGO_BASE_URL = "http://127.0.0.1:8000";

// Glowing Effect Component
const GlowingEffect = ({ spread = 40, glow = true, disabled = false, proximity = 64, inactiveZone = 0.01 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!glow || disabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate distance from edges to determine if we're in the inactive zone
      const insetX = Math.min(x, rect.width - x) / rect.width;
      const insetY = Math.min(y, rect.height - y) / rect.height;
      const isInInactiveZone = insetX < inactiveZone || insetY < inactiveZone;

      setPosition({ x, y });
      setOpacity(isInInactiveZone ? 0 : 1);
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
      setIsActive(false);
    };

    const element = document.getElementById("glowing-parent");
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [glow, disabled, inactiveZone]);

  return (
    <div
      id="glowing-parent"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    >
      {isActive && (
        <div
          className="absolute z-[-1] h-full w-full bg-gradient-radial from-white to-transparent opacity-0 transition-opacity duration-500 dark:from-neutral-500"
          style={{
            opacity: opacity * 0.5,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: `${spread * 2}px`,
            height: `${spread * 2}px`,
            left: `-${spread}px`,
            top: `-${spread}px`,
          }}
        />
      )}
    </div>
  );
};

// Card Component
const Card = ({ icon, title, children, className = "" }) => {
  return (
    <div className={`relative min-h-[14rem] w-full rounded-2xl border border-gray-700 bg-gray-900 p-2 mb-6 ${className}`}>
      <div className="relative h-full rounded-xl border border-gray-800 bg-gray-900 p-6 overflow-hidden">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-fit rounded-lg border border-gray-700 p-2 bg-gray-800">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-3 text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [userTeam, setUserTeam] = useState(null);

  const fetchUserTeam = async () => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/student/get-student-teams/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        const team = data.teams.find((team) => team.competition_id === parseInt(id));
        if (team) {
          setUserTeam(team);
          navigate(`/team/${team.team_id}`);
        }
      } else {
        console.error(data.error || "Failed to fetch user teams");
      }
    } catch (err) {
      console.error("An error occurred while fetching user teams:", err);
    }
  };

  const handleCreateTeam = async () => {
    try {
      if (userTeam) {
        alert("You are already in a team for this competition!");
        navigate(`/team/${userTeam.team_id}`);
        return;
      }

      const response = await fetch(`${DJANGO_BASE_URL}/api/create-team/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ competition_id: id, team_name: teamName }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Team created successfully! Team Code: ${data.team_code}`);
        navigate(`/team/${data.team_id}`);
      } else {
        alert(data.error || "Failed to create team");
      }
    } catch (err) {
      alert("An error occurred while creating the team. Please try again.");
    }
  };

  const handleJoinTeam = async () => {
    try {
      if (userTeam) {
        alert("You are already in a team for this competition!");
        navigate(`/team/${userTeam.team_id}`);
        return;
      }

      const response = await fetch(`${DJANGO_BASE_URL}/api/join-team/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ team_code: teamCode }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Successfully joined the team!");
        navigate(`/team/${data.team_id}`);
      } else {
        alert(data.error || "Failed to join the team");
      }
    } catch (err) {
      alert("An error occurred while joining the team. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/competitions/${id}/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch competition details");

        const data = await response.json();
        console.log("Competition data:", data);
        setCompetition(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
    fetchUserTeam();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-red-900/50 border border-red-700 rounded-xl text-white">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 mb-6 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>←</span> Back
        </button>

        {/* Hero Section */}
        <div className="relative h-48 md:h-64 lg:h-80 mb-6 rounded-2xl overflow-hidden">
          {competition.competition_picture ? (
            <img 
              src={competition.competition_picture} 
              alt={competition.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Trophy className="h-16 w-16 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{competition.name}</h1>
            <div className="flex items-center text-gray-300 text-sm">
              <span className="px-3 py-1 bg-purple-900/60 rounded-full mr-2">{competition.competition_type_name}</span>
              <span className="px-3 py-1 bg-blue-900/60 rounded-full">{competition.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Competition Details */}
          <Card icon={<Trophy className="h-5 w-5 text-purple-400" />} title="Competition Details">
            <p className="mb-2">{competition.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>Start: {new Date(competition.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-400" />
                <span>End: {new Date(competition.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-400" />
                <span>Registration: {new Date(competition.registration_deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                <span>Team Size: {competition.min_team_size} - {competition.max_team_size}</span>
              </div>
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-purple-400" />
                <span>Organizer: {competition.organizer}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-400" />
                <span>Venue: {competition.venue}</span>
              </div>
            </div>

            {competition.website && (
              <div className="mt-4">
                <a 
                  href={competition.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Visit Website
                </a>
              </div>
            )}
          </Card>

          {/* Team Management */}
          <div className="space-y-6">
            <Card 
              icon={<PlusCircle className="h-5 w-5 text-green-400" />} 
              title="Create a Team"
              className="min-h-0"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={handleCreateTeam} 
                  disabled={!teamName.trim()}
                  className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    teamName.trim() 
                      ? "bg-green-700 hover:bg-green-600" 
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Team
                </button>
              </div>
            </Card>

            <Card 
              icon={<LogIn className="h-5 w-5 text-blue-400" />} 
              title="Join a Team"
              className="min-h-0"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Team Code"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={handleJoinTeam}
                  disabled={!teamCode.trim()}
                  className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    teamCode.trim() 
                      ? "bg-blue-700 hover:bg-blue-600" 
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Join Team
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetail;