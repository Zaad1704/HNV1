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
          // Assuming /users/me or similar endpoint for user's own profile,
          // or /auth/me for current user's details
          const response = await apiClient.get(`/auth/me`); // Changed to /auth/me as it's common for current user
          setProfile(response.data.data); // Adjust based on actual API response structure
        } catch (err) {
          setError("Failed to fetch profile data.");
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div className="text-red-500 dark:text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-dark-text dark:text-dark-text-dark">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border-color dark:border-border-color-dark transition-all duration-200">
        <p>
          <strong className="text-dark-text dark:text-dark-text-dark">Name:</strong> <span className="text-light-text dark:text-light-text-dark">{profile.name}</span>
        </p>
        <p>
          <strong className="text-dark-text dark:text-dark-text-dark">Email:</strong> <span className="text-light-text dark:text-light-text-dark">{profile.email}</span>
        </p>
        <p>
          <strong className="text-dark-text dark:text-dark-text-dark">Role:</strong> <span className="text-light-text dark:text-light-text-dark">{profile.role}</span>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
