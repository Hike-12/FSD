import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">My Info</h2>
      <ul className="space-y-2">
        <li>
          <Link to="/student-teams" className="hover:underline">
            My Teams
          </Link>
        </li>
        <li>
          <Link to="/competitions" className="hover:underline">
            My Competitions
          </Link>
        </li>
      </ul>
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
      >
        Log Out
      </button>
    </div>
  );
};

export default StudentSidebar;