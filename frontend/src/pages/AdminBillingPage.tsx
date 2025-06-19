import React, { useEffect, useState } from "react";
import apiClient from "../api/client";

const AdminBillingPage: React.FC = () => {
  const [billingInfo, setBillingInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        setLoading(true);
        // Corrected the API endpoint
        const response = await apiClient.get("/super-admin/billing");
        setBillingInfo(response.data.data);
      } catch (err) {
        setError("Failed to fetch billing information.");
      } finally {
        setLoading(false);
      }
    };
    fetchBillingInfo();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getStatusClass = (status: string) => {
    switch(status) {
        case 'active':
        case 'trialing':
            return 'bg-green-100 text-green-800';
        case 'past_due':
            return 'bg-yellow-100 text-yellow-800';
        case 'canceled':
        case 'inactive': // Added inactive for consistency
        default:
            return 'bg-red-100 text-red-800';
    }
  };

  if (loading) return <div className="p-4 text-center">Loading Billing Data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex-1 p-4">
      <h1 className="text-2xl font-bold mb-4">Global Subscription Overview</h1>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-semibold">Organization</th>
              <th className="text-left p-3 font-semibold">Plan</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Next Billing / Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {billingInfo.map((info) => (
              <tr key={info._id}>
                <td className="p-3 font-medium">{info.organizationId?.name || 'N/A'}</td>
                <td className="p-3">{info.planId?.name || 'N/A'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(info.status)}`}>
                    {info.status}
                  </span>
                </td>
                <td className="p-3 text-gray-600">
                    {info.status === 'trialing' ? `(Trial) ${formatDate(info.trialExpiresAt)}` : formatDate(info.currentPeriodEndsAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBillingPage;
