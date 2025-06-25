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
        case 'trialing': return 'bg-green-500/20 text-green-300';
        case 'past_due': return 'bg-brand-accent-dark/20 text-brand-accent-dark';
        case 'canceled':
        case 'inactive':
        default: return 'bg-brand-orange/20 text-brand-orange';
    }
  };

  if (loading) return <div className="p-4 text-center text-dark-text dark:text-dark-text-dark">Loading Billing Data...</div>;
  if (error) return <div className="p-4 text-center text-red-400">{error}</div>;

  return (
    <div className="text-dark-text dark:text-dark-text-dark">
      <h1 className="text-3xl font-bold mb-8">Global Subscription Overview</h1>
      <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
        <table className="w-full text-left">
          <thead className="bg-light-bg border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Organization</th>
              <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Plan</th>
              <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
              <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Next Billing / Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
            {billingInfo.map((info) => (
              <tr key={info._id} className="hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/40">
                <td className="p-4 font-medium text-dark-text dark:text-dark-text-dark">{info.organizationId?.name || 'N/A'}</td>
                <td className="p-4 text-light-text dark:text-light-text-dark">{info.planId?.name || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(info.status)}`}>
                    {info.status}
                  </span>
                </td>
                <td className="p-4 text-light-text dark:text-light-text-dark">
                    {info.isLifetime ? 'Lifetime' : info.status === 'trialing' ? `(Trial) ${formatDate(info.trialExpiresAt)}` : formatDate(info.currentPeriodEndsAt)}
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
