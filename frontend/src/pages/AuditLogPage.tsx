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
        setError('');
        const response = await apiClient.get('/audit');
        setLogs(response.data.data);
      } catch (err) {
        setError('Failed to fetch audit logs. You may not have permission to view this page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) return <div className="text-white text-center p-8">Loading Audit Trail...</div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Audit Log</h1>
      </div>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">User</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Action</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Details</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800 transition-colors">
                    <td className="p-4">
                        <p className="font-bold text-white">{log.user?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{log.user?.email || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">
                            {log.action}
                        </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400 font-mono">
                      {log.details && Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>{`${key}: ${value}`}</div>
                      ))}
                    </td>
                    <td className="p-4 text-sm text-slate-400">{formatDate(log.timestamp)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No audit log entries found.</td>
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
