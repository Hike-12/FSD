import React from "react";
import { Link } from "react-router-dom";

const StudentNavbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4">
      <div className="text-xl font-bold">Student Portal</div>
      <div className="flex space-x-4">
        <Link to="/student-dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/competitions" className="hover:underline">
          Competitions
        </Link>
        <Link to="/student-profile" className="hover:underline">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default StudentNavbar;