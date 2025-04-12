import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DJANGO_BASE_URL } from "@/lib/utils";

const HostCompetitionDetails = () => {
  const { competitionId } = useParams();
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
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
        console.log("Competition Data:", competitionData); // Debugging line
        setCompetition(competitionData);

        // Fetch grouped submissions
        const submissionsResponse = await fetch(
          `${DJANGO_BASE_URL}/api/competitions/${competitionId}/submissions-grouped/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions");
        const submissionsData = await submissionsResponse.json();
        console.log("Submissions Data:", submissionsData); // Debugging line
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
        setGroupedSubmissions(submissionsData.submissions || {});
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
  teamMembers.forEach((member) => {
    if (!teamsByName[member.team_name]) {
      teamsByName[member.team_name] = [];
    }
    teamsByName[member.team_name].push(member);
  });

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
        <h1 className="text-3xl font-bold">{competition?.name || "Competition Details"}</h1>
        {competition && (
          <div className="mt-2 text-blue-100">
            <p>{competition.description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions Section */}
        <div className="bg-white border rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Submissions</h2>
          </div>
<div className="p-4">
  {Object.keys(groupedSubmissions).length === 0 ? (
    <div className="text-center py-8">
      <p className="mt-2 text-gray-500">No submissions yet.</p>
    </div>
  ) : (
    Object.entries(groupedSubmissions).map(([teamName, submissions]) => (
      <div key={teamName} className="mb-6">
        <h3 className="text-lg font-bold mb-2">{teamName}</h3>
        <ul className="divide-y divide-gray-200">
          {submissions.map((submission) => (
            <li key={submission.id} className="py-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{submission.title}</p>
                  <p className="text-sm text-gray-600 mb-2">{submission.description}</p>
                  
                  {/* File links */}
                  <div className="mt-2 flex space-x-3">
                    {submission.project_file_url && (
                      <a 
                        href={submission.project_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        {submission.project_file_name || "Project File"}
                      </a>
                    )}
                    
                    {submission.presentation_file_url && (
                      <a 
                        href={submission.presentation_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        {submission.presentation_file_name || "Presentation File"}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(submission.submission_date).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ))
  )}
</div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white border rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Teams & Members</h2>
          </div>
          <div className="p-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
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