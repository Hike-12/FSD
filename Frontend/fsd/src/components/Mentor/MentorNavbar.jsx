import React from "react";
import { Link } from "react-router-dom";

const MentorNavbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4">
      <div className="text-xl font-bold">Mentor Portal</div>
      <div className="flex space-x-4">
        <Link to="/mentor-dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/mentor-competitions" className="hover:underline">
          Competitions
        </Link>
        <Link to="/mentor-profile" className="hover:underline">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default MentorNavbar;