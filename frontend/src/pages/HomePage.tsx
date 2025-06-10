import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-4">Welcome to HNV SaaS Platform!</h1>
    <div className="space-x-4">
      <Link to="/login" className="p-2 bg-blue-600 text-white rounded">Login</Link>
      <Link to="/register" className="p-2 bg-green-600 text-white rounded">Register</Link>
      <Link to="/org/dashboard" className="p-2 bg-gray-600 text-white rounded">Dashboard</Link>
    </div>
  </div>
);

export default HomePage;
