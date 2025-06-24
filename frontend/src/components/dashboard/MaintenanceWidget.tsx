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
      case 'Open': return 'bg-brand-primary/20 text-brand-primary'; // Adjusted colors
      case 'In Progress': return 'bg-brand-accent-dark/20 text-brand-accent-dark'; // Adjusted colors
      case 'Completed': return 'bg-brand-accent-dark/20 text-brand-accent-dark'; // Adjusted colors
      case 'Urgent': return 'bg-red-500/20 text-red-300'; // Special styling for urgent
      default: return 'bg-brand-subtle/20 text-brand-subtle'; // Adjusted colors
    }
  };

  const getPriorityClass = (priority: IMaintenanceRequest['priority']) => {
    switch (priority) {
      case 'Urgent': return 'text-red-400 font-bold';
      case 'High': return 'text-brand-primary'; // Adjusted colors
      case 'Medium': return 'text-brand-secondary'; // Adjusted colors
      case 'Low': return 'text-brand-accent-dark'; // Adjusted colors
      default: return 'text-light-text'; // Adjusted colors
    }
  };

  if (loading) {
    return (
      <div className="bg-light-card p-8 rounded-2xl shadow-lg border border-border-color text-dark-text"> {/* Adjusted bg and text */}
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
    <div className="bg-light-card p-8 rounded-2xl shadow-lg border border-border-color text-dark-text"> {/* Adjusted bg and text */}
      <h2 className="text-xl font-bold mb-4">Recent Maintenance Requests</h2>
      {requests.length === 0 ? (
        <p className="text-light-text text-center py-4">No open or in-progress maintenance requests found.</p> {/* Adjusted text */}
      ) : (
        <ul className="space-y-4">
          {requests.slice(0, 5).map((req) => ( // Display top 5 recent requests
            <li key={req._id} className="border border-border-color p-4 rounded-lg bg-brand-secondary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"> {/* Adjusted bg and border */}
              <div className="flex-grow">
                <p className="text-lg font-semibold text-dark-text truncate max-w-[calc(100%-80px)]">{req.description}</p>
                <p className="text-light-text text-sm"> {/* Adjusted text */}
                  Property: <span className="font-medium text-dark-text">{req.propertyId?.name || 'N/A'}</span> {/* Adjusted text */}
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
        <a href="/maintenance" className="text-brand-primary hover:text-brand-accent-dark text-sm font-medium"> {/* Adjusted colors */}
          View All Maintenance Requests &rarr;
        </a>
      </div>
    </div>
  );
};

export default MaintenanceWidget;
