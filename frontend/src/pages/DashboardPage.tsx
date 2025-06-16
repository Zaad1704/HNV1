import React from 'react';
import { Building, Users, HandCoins, BarChart2 } from 'lucide-react';

const DashboardPage = () => {
  // This data would be fetched from the backend API
  const stats = {
    properties: 12,
    tenants: 48,
    occupancy: '95%',
    revenue: 15230.50
  };

  const StatCard = ({ title, value, icon, accentColor }) => (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${accentColor}`}></div>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${accentColor}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase">{title}</h3>
          <p className="text-3xl font-bold text-white mt-1 font-mono">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-8">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Properties" value={stats.properties} icon={<Building className="text-cyan-300" />} accentColor="bg-cyan-500/50" />
        <StatCard title="Active Tenants" value={stats.tenants} icon={<Users className="text-pink-300" />} accentColor="bg-pink-500/50" />
        <StatCard title="Occupancy Rate" value={stats.occupancy} icon={<BarChart2 className="text-emerald-300" />} accentColor="bg-emerald-500/50" />
        <StatCard title="Monthly Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<HandCoins className="text-yellow-300" />} accentColor="bg-yellow-500/50" />
      </div>
      
      <div className="mt-10 bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white">Revenue Analytics</h2>
        <div className="mt-4 text-slate-400">
          <p className="mb-4">This area will display a chart of recent revenue or occupancy trends.</p>
          {/* A developer would use a library like Recharts here to render a real chart */}
          <div className="w-full h-64 bg-slate-900/50 rounded-lg flex items-center justify-center border border-dashed border-slate-600">
            [Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
