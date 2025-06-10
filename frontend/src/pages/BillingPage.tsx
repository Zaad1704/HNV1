import React, { useEffect, useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export

const BillingPage: React.FC = () => {
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        const response = await apiClient.get("/billing");
        setBillingInfo(response.data);
      } catch (err) {
        setError("Failed to fetch billing information.");
      }
    };
    fetchBillingInfo();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Billing Information</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>
          <strong>Plan:</strong> {billingInfo.plan}
        </p>
        <p>
          <strong>Status:</strong> {billingInfo.status}
        </p>
        <p>
          <strong>Next Billing Date:</strong>{" "}
          {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
        </p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md">
          Manage Subscription
        </button>
      </div>
    </div>
  );
};

export default BillingPage;
