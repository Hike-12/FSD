import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {DJANGO_BASE_URL} from "@/lib/utils";

const HostCompetitionDetails = () => {
  const { competitionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competition, setCompetition] = useState(null);

  useEffect(() => {
    const fetchCompetitionDetails = async () => {
      try {
        setLoading(true);

        // Fetch competition details
        const competitionResponse = await fetch(
          `${DJANGO_BASE_URL}/api/competitions/${competitionId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!competitionResponse.ok) throw new Error("Failed to fetch competition details");
        const competitionData = await competitionResponse.json();
        setCompetition(competitionData);

        // Fetch submissions
        const submissionsResponse = await fetch(
          `${DJANGO_BASE_URL}/api/competitions/${competitionId}/submissions/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions");
        const submissionsData = await submissionsResponse.json();
        
        // Fetch team members
        const teamMembersResponse = await fetch(
          `${DJANGO_BASE_URL}/api/competitions/${competitionId}/team-members/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!teamMembersResponse.ok) throw new Error("Failed to fetch team members");
        const teamMembersData = await teamMembersResponse.json();

        // Update state
        setSubmissions(submissionsData.submissions || []);
        setTeamMembers(teamMembersData.team_members || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitionDetails();
  }, [competitionId]);

  // Group team members by team
  const teamsByName = {};
  teamMembers.forEach(member => {
    if (!teamsByName[member.team_name]) {
      teamsByName[member.team_name] = [];
    }
    teamsByName[member.team_name].push(member);
  });

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-400 p-4 rounded bg-red-50">
        <p className="text-red-500 font-medium">Error: {error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">{competition?.title || "Competition Details"}</h1>
        {competition && (
          <div className="mt-2 text-blue-100">
            <p>{competition.description}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-blue-900 bg-opacity-40 px-3 py-1 rounded">
                <span className="text-xs uppercase tracking-wide">Start Date</span>
                <p className="font-medium">{new Date(competition.start_date).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-900 bg-opacity-40 px-3 py-1 rounded">
                <span className="text-xs uppercase tracking-wide">End Date</span>
                <p className="font-medium">{new Date(competition.end_date).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-900 bg-opacity-40 px-3 py-1 rounded">
                <span className="text-xs uppercase tracking-wide">Status</span>
                <p className="font-medium">{competition.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions Section */}
        <div className="bg-white border rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Submissions</h2>
            <p className="text-gray-600 text-sm mt-1">Total: {submissions.length}</p>
          </div>
          
          <div className="p-4">
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-500">No submissions yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <li key={submission.id} className="py-4 hover:bg-gray-50 rounded-lg transition duration-150">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-medium text-gray-900">{submission.title}</p>
                        <p className="text-sm text-gray-600">Team: {submission.team_name}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                      <span>Submitted: {new Date(submission.submission_date).toLocaleString()}</span>
                      <span>ID: {submission.id}</span>
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white border rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Teams & Members</h2>
            <p className="text-gray-600 text-sm mt-1">
              Total: {Object.keys(teamsByName).length} teams, {teamMembers.length} members
            </p>
          </div>
          
          <div className="p-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-2 text-gray-500">No team members found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(teamsByName).map(([teamName, members]) => (
                  <div key={teamName} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium flex justify-between items-center">
                      <span>{teamName}</span>
                      <span className="text-sm text-gray-500">{members.length} members</span>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {members.map((member) => (
                        <li key={member.member_id} className="p-3 hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center">
                                {member.member_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{member.member_name}</p>
                              <p className="text-sm text-gray-500">{member.member_email}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostCompetitionDetails;