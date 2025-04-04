import React from "react";
import Chat from "./Chat";
import TaskManager from "./TaskManager";
import FileManager from "./FileManager"; // Import FileManager
import { useNavigate, useParams } from "react-router-dom";

const Workspace = () => {
  const teamId = useParams().teamId; // Get the team ID from the URL parameters
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(`/team/${teamId}`); // Go back to the previous page
  };

  return (
    <div>
      <button onClick={handleGoBack}>Go Back</button>
      <Chat />
      <TaskManager />
      <FileManager /> {/* Add FileManager */}
    </div>
  );
};

export default Workspace;