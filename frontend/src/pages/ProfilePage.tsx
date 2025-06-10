import React, { useEffect, useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export
import { useAuthStore } from "../store/authStore";

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const response = await apiClient.get(`/users/${user.id}`);
          setProfile(response.data);
        } catch (err) {
          setError("Failed to fetch profile data.");
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Role:</strong> {profile.role}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
