import React from 'react';

const DashboardPage = () => {
  // This data would be fetched from the backend API
  const stats = {
    properties: 12,
    tenants: 48,
    occupancy: '95%',
    revenue: 15230.50
  };

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-8">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase">Total Properties</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.properties}</p>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase">Active Tenants</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.tenants}</p>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase">Occupancy Rate</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.occupancy}</p>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">${stats.revenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-10 bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <p className="mt-4 text-slate-400">
          This area will display a list of recent payments, new tenant sign-ups, and maintenance requests, fetched from your backend API.
        </p>
        {/* A developer would map over real activity data here */}
      </div>
    </div>
  );
};

export default DashboardPage;
