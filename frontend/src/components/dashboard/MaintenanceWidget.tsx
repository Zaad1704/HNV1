// frontend/src/components/dashboard/MaintenanceWidget.tsx

import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client'; // Your Axios API client

interface IMaintenanceRequest {
  _id: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Closed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  propertyId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const MaintenanceWidget: React.FC = () => {
  const [requests, setRequests] = useState<IMaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch only 'Open' or 'In Progress' requests for the dashboard widget
        const response = await apiClient.get('/maintenance', {
          params: { status: ['Open', 'In Progress'] } // You can extend backend to filter by status
        });
        setRequests(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch maintenance requests:", err);
        setError(err.response?.data?.message || 'Failed to load maintenance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, []); // Empty dependency array means this runs once on mount

  const getStatusClass = (status: IMaintenanceRequest['status']) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/20 text-blue-300';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'Completed': return 'bg-green-500/20 text-green-300';
      case 'Urgent': return 'bg-red-500/20 text-red-300'; // Special styling for urgent
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityClass = (priority: IMaintenanceRequest['priority']) => {
    switch (priority) {
      case 'Urgent': return 'text-red-400 font-bold';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Recent Maintenance Requests</h2>
        <div className="text-center py-4">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-red-700 text-red-300">
        <h2 className="text-xl font-bold mb-4">Maintenance Requests Error</h2>
        <div className="text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 text-white">
      <h2 className="text-xl font-bold mb-4">Recent Maintenance Requests</h2>
      {requests.length === 0 ? (
        <p className="text-slate-400 text-center py-4">No open or in-progress maintenance requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.slice(0, 5).map((req) => ( // Display top 5 recent requests
            <li key={req._id} className="border border-slate-700 p-4 rounded-lg bg-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex-grow">
                <p className="text-lg font-semibold text-white truncate max-w-[calc(100%-80px)]">{req.description}</p>
                <p className="text-sm text-slate-400">
                  Property: <span className="font-medium text-slate-300">{req.propertyId?.name || 'N/A'}</span>
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>
                  {req.status}
                </span>
                <span className={`text-xs uppercase ${getPriorityClass(req.priority)}`}>
                  {req.priority}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 text-right">
        <a href="/maintenance" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
          View All Maintenance Requests &rarr;
        </a>
      </div>
    </div>
  );
};

export default MaintenanceWidget;
