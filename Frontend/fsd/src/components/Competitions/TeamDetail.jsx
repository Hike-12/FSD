"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import  Chat from "@/components/Chat/Chat";

import DJANGO_BASE_URL from "@/lib/utils";

const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const messagesEndRef = useRef(null);

  // Mock data for development
  // const mockTeam = {
  //   id: teamId,
  //   name: "Quantum Coders",
  //   competition_name: "AI Innovation Hackathon",
  //   competition_description: "Develop AI solutions for real-world problems in healthcare.",
  //   competition_start_date: "2025-03-15",
  //   competition_end_date: "2025-04-30",
  //   competition_registration_deadline: "2025-03-10",
  //   competition_min_team_size: 2,
  //   competition_max_team_size: 5,
  //   competition_organizer: "Tech Innovators Inc.",
  //   competition_venue: "Virtual",
  //   competition_website: "https://ai-hackathon.example.com",
  //   team_code: "QUANT-2025",
  //   status: "Active",
  //   progress: 65,
  //   members: [
  //     { id: 1, full_name: "Alex Johnson", role: "Team Lead", avatar: "AJ", online: true },
  //     { id: 2, full_name: "Sam Wilson", role: "Backend Developer", avatar: "SW", online: false },
  //     { id: 3, full_name: "Taylor Smith", role: "UI/UX Designer", avatar: "TS", online: true },
  //   ],
  //   tasks: [
  //     { id: 1, title: "Project Proposal", completed: true, due_date: "2025-03-20" },
  //     { id: 2, title: "Initial Prototype", completed: true, due_date: "2025-04-05" },
  //     { id: 3, title: "Final Submission", completed: false, due_date: "2025-04-30" },
  //   ],
  //   files: [
  //     { id: 1, name: "Project_Spec.pdf", uploaded_by: "Alex Johnson", date: "2025-03-18" },
  //     { id: 2, name: "Wireframes.sketch", uploaded_by: "Taylor Smith", date: "2025-03-22" },
  //   ]
  // };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // For development, using mock data
        // setTeam(mockTeam);
        
        // Uncomment for production
  
        const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch team details");

        const data = await response.json();
        setTeam(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();

    // Mock chat messages
    setMessages([
      { id: 1, sender: "Alex Johnson", message: "Hey team, let's discuss our project approach", time: "10:30 AM", isCurrentUser: false },
      { id: 2, sender: "You", message: "I was thinking we could use React for the frontend", time: "10:32 AM", isCurrentUser: true },
      { id: 3, sender: "Taylor Smith", message: "I'll work on the UI mockups this week", time: "10:35 AM", isCurrentUser: false },
    ]);
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (newMemberEmail.trim() === "") return;

    alert(`Invitation sent to ${newMemberEmail}`);
    setNewMemberEmail("");
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  if (!team) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
              <p className="text-gray-400">{team.competition_name}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium">
                {team.status}
              </span>
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-medium">
                Team Code: {team.team_code}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Team Progress</span>
            <span className="text-sm font-medium text-blue-400">{team.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" 
              style={{ width: `${team.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview" ? "border-purple-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "members" ? "border-purple-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "tasks" ? "border-purple-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "files" ? "border-purple-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "chat" ? "border-purple-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"}`}
            >
              Team Chat
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4">Competition Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Description</h3>
                    <p className="text-gray-400">{team.competition_description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Timeline</h3>
                    <div className="space-y-2">
                      <p className="text-gray-400"><span className="font-medium">Start:</span> {new Date(team.competition_start_date).toLocaleDateString()}</p>
                      <p className="text-gray-400"><span className="font-medium">End:</span> {new Date(team.competition_end_date).toLocaleDateString()}</p>
                      <p className="text-gray-400"><span className="font-medium">Registration Deadline:</span> {new Date(team.competition_registration_deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Team Requirements</h3>
                    <p className="text-gray-400">
                      <span className="font-medium">Team Size:</span> {team.competition_min_team_size} - {team.competition_max_team_size} members
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Organizer</h3>
                    <p className="text-gray-400">{team.competition_organizer}</p>
                    {team.competition_website && (
                      <a 
                        href={team.competition_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 inline-flex items-center mt-1"
                      >
                        Visit Website
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Team Members</h2>
                  <button 
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium"
                    onClick={() => document.getElementById('invite_modal').showModal()}
                  >
                    Invite Member
                  </button>
                </div>
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {member.avatar}
                        </div>
                        {member.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                      <div className="ml-auto">
                        <button className="text-gray-400 hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Team Tasks</h2>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium">
                    Add Task
                  </button>
                </div>
                <div className="space-y-3">
                  {team.tasks.map((task) => (
                    <div key={task.id} className="p-4 bg-gray-700 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-start">
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          className="mt-1 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="ml-3 flex-1">
                          <p className={`font-medium ${task.completed ? "text-gray-400 line-through" : "text-white"}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Shared Files</h2>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium">
                    Upload File
                  </button>
                </div>
                <div className="space-y-4">
                  {team.files.map((file) => (
                    <div key={file.id} className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="p-2 rounded bg-gray-600">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          Uploaded by {file.uploaded_by} on {new Date(file.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chat" && (<Chat />)}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Competition Card */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4">Competition Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Organizer</p>
                  <p className="text-white">{team.competition_organizer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Venue</p>
                  <p className="text-white">{team.competition_venue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  {team.competition_website ? (
                    <a 
                      href={team.competition_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                    >
                      Visit
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </a>
                  ) : (
                    <p className="text-gray-400">N/A</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <span>Submit Project</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <span>View Leaderboard</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <span>Schedule Meeting</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4">Team Members</h3>
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.avatar}
                      </div>
                      {member.online && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{member.full_name}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <dialog id="invite_modal" className="modal">
        <div className="modal-box bg-gray-800 border border-gray-700 max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Invite New Member</h3>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="modal-action">
              <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default TeamDetail;