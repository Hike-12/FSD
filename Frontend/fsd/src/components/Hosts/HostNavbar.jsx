import React from "react";
import { Link } from "react-router-dom";

const HostNavbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4">
      <div className="text-xl font-bold">Host Portal</div>
      <div className="flex space-x-4">
        <Link to="/host-dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/host-competitions" className="hover:underline">
          Competitions
        </Link>
        <Link to="/host-profile" className="hover:underline">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default HostNavbar;