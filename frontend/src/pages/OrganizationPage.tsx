import React, { useEffect, useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export

type Org = {
  id: string;
  name: string;
  owner: string;
};

const OrganizationPage: React.FC = () => {
  const [org, setOrg] = useState<Org | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await apiClient.get("/organization");
        setOrg(response.data);
      } catch (err) {
        setError("Failed to fetch organization data.");
      }
    };
    fetchOrg();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Organization Details</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>
          <strong>ID:</strong> {org.id}
        </p>
        <p>
          <strong>Name:</strong> {org.name}
        </p>
        <p>
          <strong>Owner:</strong> {org.owner}
        </p>
      </div>
    </div>
  );
};

export default OrganizationPage;
