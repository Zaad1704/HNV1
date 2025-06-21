// frontend/src/pages/DashboardPage.tsx
import React from 'react';
import { Building, Users, HandCoins, BarChart2 } from 'lucide-react';
import MaintenanceWidget from '../components/dashboard/MaintenanceWidget';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import FinancialChart from '../components/charts/FinancialChart'; // Assuming this exists
import OccupancyChart from '../components/charts/OccupancyChart'; // Assuming this exists

// API Fetching Functions (re-using from OverviewPage or defining new ones if different)
const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};
const fetchFinancialSummary = async () => {
    const { data } = await apiClient.get('/dashboard/financial-summary');
    return data.data;
};
const fetchOccupancySummary = async () => {
    const { data } = await apiClient.get('/dashboard/occupancy-summary');
    return data.data;
};


// Reusable StatCard Component
const StatCard = ({ title, value, icon, accentColor, currency = '' }) => ( // Added currency prop
  <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
    <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${accentColor}`}></div>

    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${accentColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1 font-mono">{currency}{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  // Fetch data using useQuery
  const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchOverviewStats });
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({ queryKey: ['financialSummary'], queryFn: fetchFinancialSummary });
  const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({ queryKey: ['occupancySummary'], queryFn: fetchOccupancySummary });


  const isLoading = isLoadingStats || isLoadingFinancial || isLoadingOccupancy;

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading Dashboard Data...</div>;
  }

  // Use optional chaining for stats data
  const totalProperties = stats?.totalProperties || 0;
  const activeTenants = stats?.activeTenants || 0;
  const monthlyRevenue = stats?.monthlyRevenue || 0;
  const occupancyRate = stats?.occupancyRate || '0%'; // Assuming backend provides this or calculate

  return (
    <div className="text-white min-h-[calc(100vh-160px)]">
      <h1 className="text-4xl font-bold mb-8 text-white">Overview</h1>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          icon={<Building className="text-cyan-300 w-7 h-7" />}
          accentColor="bg-cyan-500/50"
        />
        <StatCard
          title="Active Tenants"
          value={activeTenants}
          icon={<Users className="text-pink-300 w-7 h-7" />}
          accentColor="bg-pink-500/50"
        />
        <StatCard
          title="Occupancy Rate"
          value={occupancyRate}
          icon={<BarChart2 className="text-emerald-300 w-7 h-7" />}
          accentColor="bg-emerald-500/50"
        />
        <StatCard
          title="Monthly Revenue"
          value={monthlyRevenue}
          currency="$"
          icon={<HandCoins className="text-yellow-300 w-7 h-7" />}
          accentColor="bg-yellow-500/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* Maintenance Widget */}
        <div>
          <MaintenanceWidget />
        </div>

        {/* Revenue Analytics Widget */}
        <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Financials (Last 6 Months)</h2>
          {isLoadingFinancial ? <p className="text-slate-400">Loading financial data...</p> : <FinancialChart data={financialData || []} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"> {/* Added a new grid for another chart if needed */}
        {/* Occupancy Growth Chart */}
        <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Occupancy Growth</h2>
            {isLoadingOccupancy ? <p className="text-slate-400">Loading occupancy data...</p> : <OccupancyChart data={occupancyData || []} />}
        </div>

        {/* Recent Activity - Adjusted Styling */}
        <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
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
    </div>
  );
};

export default DashboardPage;
