import React from 'react';
import { Building, Users, HandCoins, BarChart2 } from 'lucide-react'; // Import Lucide icons
import MaintenanceWidget from '../components/dashboard/MaintenanceWidget'; // FIX: Import MaintenanceWidget

// Reusable StatCard Component
const StatCard = ({ title, value, icon, accentColor }) => (
  <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
    {/* Background swirl effect */}
    <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${accentColor}`}></div>
    
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${accentColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1 font-mono">{value}</p> {/* FIX: Added font-mono for techy feel */}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  // This data would typically be fetched from the backend API
  const stats = {
    properties: 12,
    tenants: 48,
    occupancy: '95%',
    revenue: 15230.50
  };

  return (
    <div className="text-white min-h-[calc(100vh-160px)]"> {/* FIX: Added min-height for better layout */}
      <h1 className="text-4xl font-bold mb-8 text-white">Overview</h1>
      
      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* FIX: Responsive grid */}
        <StatCard 
          title="Total Properties" 
          value={stats.properties} 
          icon={<Building className="text-cyan-300 w-7 h-7" />} 
          accentColor="bg-cyan-500/50" 
        />
        <StatCard 
          title="Active Tenants" 
          value={stats.tenants} 
          icon={<Users className="text-pink-300 w-7 h-7" />} 
          accentColor="bg-pink-500/50" 
        />
        <StatCard 
          title="Occupancy Rate" 
          value={stats.occupancy} 
          icon={<BarChart2 className="text-emerald-300 w-7 h-7" />} 
          accentColor="bg-emerald-500/50" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={<HandCoins className="text-yellow-300 w-7 h-7" />} 
          accentColor="bg-yellow-500/50" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10"> {/* FIX: Responsive grid for new sections */}
        {/* Maintenance Widget */}
        <div>
          <MaintenanceWidget /> {/* FIX: Integrated MaintenanceWidget */}
        </div>

        {/* Revenue Analytics Widget - Techy & Geeky Design */}
        <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Analytics</h2>
          <div className="mt-4 text-slate-400">
            <p className="mb-4">This area will display a chart of recent revenue or occupancy trends with a sleek, techy look.</p>
            {/* A developer would use a library like Recharts here to render a real chart */}
            <div className="w-full h-64 bg-slate-900/50 rounded-lg flex items-center justify-center border border-dashed border-cyan-600 text-cyan-500 text-lg"> {/* FIX: Techy border and text */}
              [📈 Chart Placeholder]
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Adjusted Styling */}
      <div className="mt-6 bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700"> {/* FIX: Adjusted margin top */}
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <p className="mt-4 text-slate-400">
          This area will display a list of recent payments, new tenant sign-ups, and other general activity, fetched from your backend API, in a clean, modern list.
        </p>
        {/* A developer would map over real activity data here */}
        <ul className="mt-6 space-y-3">
            <li className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-slate-300 text-sm flex justify-between items-center">
                <span>Received $1200 from John Doe (Rent)</span>
                <span className="text-xs text-slate-500">2 hours ago</span>
            </li>
            <li className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-slate-300 text-sm flex justify-between items-center">
                <span>New Tenant: Jane Smith (Unit 4B)</span>
                <span className="text-xs text-slate-500">Yesterday</span>
            </li>
            <li className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-slate-300 text-sm flex justify-between items-center">
                <span>Maintenance Request: Leaky Faucet (Property A)</span>
                <span className="text-xs text-slate-500">3 days ago</span>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
