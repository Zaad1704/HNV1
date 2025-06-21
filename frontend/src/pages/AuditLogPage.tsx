import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuditLogPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/audit');
        setLogs(response.data.data);
      } catch (err) {
        setError('Failed to fetch audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  if (loading) return <div className="text-center p-8">Loading Audit Trail...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="text-dark-text">
      <h1 className="text-3xl font-bold mb-8">Audit Log</h1>
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
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                        <p className="font-semibold text-dark-text">{log.user?.name || 'N/A'}</p>
                        <p className="text-xs text-light-text">{log.user?.email || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-brand-dark">
                            {log.action}
                        </span>
                    </td>
                    <td className="p-4 text-sm text-light-text font-mono">
                      {log.details && Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>{`${key}: ${value}`}</div>
                      ))}
                    </td>
                    <td className="p-4 text-sm text-light-text">{formatDate(log.timestamp)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-light-text">No audit log entries found.</td>
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
