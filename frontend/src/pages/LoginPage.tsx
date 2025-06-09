import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token); // Optionally use cookies in prod
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-80 p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
        <h2 className="text-2xl mb-4">Login</h2>
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <input
          className="w-full mb-3 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="w-full p-2 bg-blue-600 text-white rounded" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;