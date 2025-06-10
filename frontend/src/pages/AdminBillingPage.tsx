import React, { useEffect, useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export
import AdminSidebar from "../components/admin/AdminSidebar";

type BillingInfo = {
  id: string;
  organization: {
    name: string;
  };
  plan: string;
  status: string;
  nextBillingDate: string;
};

const AdminBillingPage: React.FC = () => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        const response = await apiClient.get("/admin/billing");
        setBillingInfo(response.data);
      } catch (err) {
        setError("Failed to fetch billing information.");
      }
    };
    fetchBillingInfo();
  }, []);

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-4">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Billing Information</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Organization</th>
                <th className="text-left">Plan</th>
                <th className="text-left">Status</th>
                <th className="text-left">Next Billing Date</th>
              </tr>
            </thead>
            <tbody>
              {billingInfo.map((info) => (
                <tr key={info.id}>
                  <td>{info.organization.name}</td>
                  <td>{info.plan}</td>
                  <td>{info.status}</td>
                  <td>{new Date(info.nextBillingDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBillingPage;
