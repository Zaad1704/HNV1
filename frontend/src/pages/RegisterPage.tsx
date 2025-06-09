import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "Tenant"
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-96 p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
        <h2 className="text-2xl mb-4">Register</h2>
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <input
          className="w-full mb-3 p-2 border rounded"
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          className="w-full mb-3 p-2 border rounded"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="Tenant">Tenant</option>
          <option value="Landlord">Landlord</option>
          <option value="Agent">Agent</option>
        </select>
        <button className="w-full p-2 bg-blue-600 text-white rounded" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;