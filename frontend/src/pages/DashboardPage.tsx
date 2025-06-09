import React from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Dashboard</h1>
        <button onClick={handleLogout} className="p-2 bg-red-600 text-white rounded">
          Logout
        </button>
      </div>
      <div>
        <p>
          Welcome, <span className="font-semibold">{user?.name}</span>!<br />
          Role: <span className="font-semibold">{user?.role}</span>
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;