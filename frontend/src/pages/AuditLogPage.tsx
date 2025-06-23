import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import { useQuery } from '@tanstack/react-query';

// --- API Fetching Functions ---
const fetchAuditLogs = async (filters: any) => {
    // Pass filters as query parameters
    const { data } = await apiClient.get('/audit', { params: filters });
    return data.data;
};

const fetchOrgUsers = async () => {
    const { data } = await apiClient.get('/users/organization');
    return data.data;
};


const AuditLogPage = () => {
  // State to hold the current filter values
  const [filters, setFilters] = useState({ userId: '', action: '', startDate: '', endDate: '' });

  // Fetch logs based on the current filters. React Query will refetch when filters change.
  const { data: logs = [], isLoading, isError } = useQuery({
      queryKey: ['auditLogs', filters],
      queryFn: () => fetchAuditLogs(filters)
  });
  
  // Fetch users to populate the filter dropdown
  const { data: users = [] } = useQuery({ queryKey: ['orgUsersForAudit'], queryFn: fetchOrgUsers });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="text-dark-text">
      <h1 className="text-3xl font-bold mb-8">Audit Log</h1>
      
      {/* --- NEW: Filters UI --- */}
      <div className="p-4 bg-light-card rounded-xl border border-border-color mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
              <label className="text-sm font-medium text-light-text">User</label>
              <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg">
                  <option value="">All Users</option>
                  {users.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
              </select>
          </div>
          <div>
              <label className="text-sm font-medium text-light-text">Action Type</label>
              <input type="text" name="action" placeholder="e.g., TENANT_UPDATE" value={filters.action} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg"/>
          </div>
          <div>
              <label className="text-sm font-medium text-light-text">Start Date</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg"/>
          </div>
          <div>
              <label className="text-sm font-medium text-light-text">End Date</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full mt-1 p-2 border rounded-md bg-light-bg"/>
          </div>
      </div>

      <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border-color">
              <tr>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">User</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Action</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Details</th>
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center">Loading logs...</td></tr>
              ) : isError ? (
                <tr><td colSpan={4} className="p-8 text-center text-red-500">Failed to fetch logs.</td></tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-top">
                        <p className="font-semibold text-dark-text">{log.user?.name || 'N/A'}</p>
                        <p className="text-xs text-light-text">{log.user?.email || 'Unknown'}</p>
                    </td>
                    <td className="p-4 align-top">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-brand-dark">
                            {log.action}
                        </span>
                    </td>
                    <td className="p-4 align-top text-sm text-light-text font-mono">
                      {/* Render the details object in a readable way */}
                      {log.details && Object.entries(log.details).map(([key, value]) => (
                        <div key={key}><strong className="text-gray-500">{key}:</strong> {JSON.stringify(value)}</div>
                      ))}
                    </td>
                    <td className="p-4 align-top text-sm text-light-text">{formatDate(log.timestamp)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-light-text">No audit log entries found for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
