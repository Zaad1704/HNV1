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
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const getStatusClass = (status: string) => {
    switch(status) {
        case 'active':
        case 'trialing': return 'bg-green-100 text-green-800';
        case 'past_due': return 'bg-yellow-100 text-yellow-800';
        case 'canceled':
        case 'inactive':
        default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) return <div className="p-4 text-center">Loading Billing Data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="text-dark-text">
      <h1 className="text-3xl font-bold mb-8">Global Subscription Overview</h1>
      <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border-color">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-text uppercase">Organization</th>
              <th className="p-4 text-sm font-semibold text-light-text uppercase">Plan</th>
              <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
              <th className="p-4 text-sm font-semibold text-light-text uppercase">Next Billing / Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {billingInfo.map((info) => (
              <tr key={info._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{info.organizationId?.name || 'N/A'}</td>
                <td className="p-4 text-light-text">{info.planId?.name || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(info.status)}`}>
                    {info.status}
                  </span>
                </td>
                <td className="p-4 text-light-text">
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
