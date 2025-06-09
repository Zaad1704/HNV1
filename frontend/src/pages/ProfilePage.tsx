import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl mb-4">Profile</h2>
      <div><b>Name:</b> {profile.name}</div>
      <div><b>Email:</b> {profile.email}</div>
      <div><b>Role:</b> {profile.role}</div>
    </div>
  );
};

export default ProfilePage;