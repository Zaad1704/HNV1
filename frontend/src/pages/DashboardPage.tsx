import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, DollarSign, TrendingUp, Bell, Calendar, Settings, BarChart3 } from 'lucide-react';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';
import DashboardMonitor from '../components/dashboard/DashboardMonitor';
import { SkeletonStats } from '../components/common/SkeletonLoader';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';
import ViewOnlyDashboard from '../components/dashboard/ViewOnlyDashboard';
import FloatingHelpCenter from '../components/common/FloatingHelpCenter';
import FloatingQuickActions from '../components/common/FloatingQuickActions';
import { useAuthStore } from '../store/authStore';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

interface DashboardStats {
  totalProperties: number;
  totalTenants: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingMaintenance: number;
  recentPayments: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const { data } = await apiClient.get('/dashboard/stats', {
      headers: { 'Cache-Control': 'max-age=300' } // 5 minutes cache
    });
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }
    return data.data;
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    // Don't throw error, return default values to prevent crashes
    return {
      totalProperties: 0,
      totalTenants: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingMaintenance: 0,
      recentPayments: 0
    };
  }
};

const DashboardPage = () => {
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  
  console.log('DashboardPage rendering...');
  
  // Check if user is inactive and should see view-only dashboard
  const isInactive = user && (
    user.status === 'pending' || 
    user.status === 'suspended' || 
    !user.isEmailVerified ||
    (user.subscription && (
      user.subscription.status === 'inactive' ||
      user.subscription.status === 'canceled' ||
      user.subscription.status === 'past_due' ||
      (user.subscription.trialExpiresAt && new Date(user.subscription.trialExpiresAt) < new Date())
    ))
  );
  
  if (isInactive) {
    return <ViewOnlyDashboard />;
  }
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 300000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 240000, // 4 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Use cache on mount
    keepPreviousData: true // Keep previous data while fetching new
  });

  const defaultStats: DashboardStats = {
    totalProperties: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    pendingMaintenance: 0,
    recentPayments: 0
  };

  const dashboardStats = stats || defaultStats;
  const showContent = !isLoading || stats; // Show content if not loading OR if we have cached data

  console.log('Dashboard state:', { isLoading, error, stats, showContent });

  if (isLoading && !stats) {
    console.log('Showing loading skeleton...');
    return (
      <div className="p-6 pt-0">
        <SkeletonStats />
      </div>
    );
  }

  if (error && !stats) {
    console.log('Dashboard error:', error);
    
    // If it's a 401/403 error or organization-related, show empty dashboard
    if (error?.response?.status === 401 || error?.response?.status === 403 || 
        error?.message?.includes('organization') || error?.message?.includes('Not authorized')) {
      console.log('Showing empty dashboard for new user');
      return <EmptyDashboard />;
    }
    
    return (
      <div className="p-6 pt-0">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Dashboard Temporarily Unavailable</h2>
          <p className="text-text-secondary mb-4">
            {error?.userMessage || 'We\'re having trouble loading your dashboard data.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => refetch()}
              className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-2xl font-semibold border border-app-border text-text-secondary hover:text-text-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show empty dashboard if user has no data (all stats are 0)
  if (stats && Object.values(stats).every(val => val === 0)) {
    console.log('Showing empty dashboard - no data');
    return <EmptyDashboard />;
  }

  return (
    <>
      <DashboardMonitor />
      <FloatingHelpCenter />
      <FloatingQuickActions />
      <motion.main
        className={`p-6 pt-0 ${isLoading && stats ? 'opacity-90' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
      {isLoading && stats && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-brand-blue text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Updating...
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="gradient-dark-orange-blue rounded-3xl p-8 sm:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between text-white"
          variants={cardVariants}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <div>
            <div className="w-12 h-12 bg-white/25 rounded-full mb-4 flex items-center justify-center">
              <BarChart3 size={24} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold leading-tight">Dashboard</h1>
            <p className="text-white/80 mt-4 max-w-sm">Welcome to your property management hub. Access all your tools and insights from here.</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-white/70 text-sm">Properties</p>
                <p className="text-2xl font-bold">{dashboardStats.totalProperties}</p>
                <p className="text-white/60 text-xs mt-1">Active properties</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-white/70 text-sm">Tenants</p>
                <p className="text-2xl font-bold">{dashboardStats.totalTenants}</p>
                <p className="text-white/60 text-xs mt-1">Total tenants</p>
              </div>
            </div>
          </div>
          <Link to="/dashboard/properties" className="bg-white text-brand-orange font-bold py-3 px-6 rounded-2xl mt-8 self-start text-sm hover:shadow-lg transition-all">
            View Properties
          </Link>
        </motion.div>

        <motion.div className="app-surface border border-app-border rounded-3xl p-6 flex flex-col" variants={cardVariants} custom={1} initial="hidden" animate="visible">
          <div className="w-12 h-12 gradient-orange-blue rounded-xl mb-4 flex items-center justify-center">
            <DollarSign size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Monthly Revenue</h2>
          <p className="text-3xl font-bold text-brand-orange mt-2">
            {currency}{dashboardStats.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-text-secondary text-sm mt-2 flex-grow">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} earnings
          </p>
        </motion.div>

        <motion.div className="app-surface border border-app-border rounded-3xl p-6 flex flex-col" variants={cardVariants} custom={2} initial="hidden" animate="visible">
          <div className="w-12 h-12 gradient-orange-blue rounded-xl mb-4 flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Occupancy Rate</h2>
          <p className="text-3xl font-bold text-brand-blue mt-2">{dashboardStats.occupancyRate}%</p>
          <p className="text-text-secondary text-sm mt-2 flex-grow">
            {dashboardStats.totalTenants} of {dashboardStats.totalProperties} units occupied
          </p>
          <Link to="/dashboard/properties" className="gradient-dark-orange-blue text-white font-semibold py-2 px-5 rounded-2xl mt-4 self-start text-sm hover:shadow-lg transition-all">View Properties</Link>
        </motion.div>
        
        <motion.div className="gradient-orange-blue rounded-3xl p-6 text-white" style={{ transform: 'rotate(-2deg)'}} variants={cardVariants} custom={3} initial="hidden" animate="visible">
          <div className="w-10 h-10 bg-white/25 rounded-full mb-3 flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Maintenance</h2>
          <p className="text-white/80 text-sm mt-1">
            {dashboardStats.pendingMaintenance} {dashboardStats.pendingMaintenance === 1 ? 'request' : 'requests'} pending
          </p>
          <Link to="/dashboard/maintenance" className="bg-white text-brand-orange px-3 py-1 rounded-full text-xs font-semibold mt-3 inline-block hover:shadow-lg transition-all">
            View All
          </Link>
        </motion.div>

        <motion.div className="app-surface border border-app-border rounded-3xl p-6 flex flex-col justify-center items-center text-center" variants={cardVariants} custom={4} initial="hidden" animate="visible">
          <div className="w-16 h-16 gradient-dark-orange-blue rounded-2xl mb-4 flex items-center justify-center">
            <img src="/logo-min.png" alt="HNV Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-2xl font-bold gradient-dark-orange-blue bg-clip-text text-transparent">
              HNV Platform
          </h2>
          <p className="text-text-secondary text-sm mt-2">Property Management Solutions</p>
        </motion.div>
        
        <motion.div className="app-surface border border-app-border rounded-3xl p-6 sm:col-span-2" variants={cardVariants} custom={5} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 gradient-dark-orange-blue rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <h3 className="text-text-secondary font-semibold text-sm">Recent Activity</h3>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-text-primary">Latest Updates</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-app-bg rounded-2xl">
              <div className="w-10 h-10 gradient-orange-blue rounded-full flex items-center justify-center">
                <DollarSign size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">
                  {dashboardStats.recentPayments} new {dashboardStats.recentPayments === 1 ? 'payment' : 'payments'}
                </p>
                <p className="text-text-secondary text-sm">
                  {dashboardStats.recentPayments > 0 ? 'Received in the last 24 hours' : 'No recent payments'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-app-bg rounded-2xl">
              <div className="w-10 h-10 gradient-dark-orange-blue rounded-full flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">Tenant portal active</p>
                <p className="text-text-secondary text-sm">All tenants can access their accounts</p>
              </div>
            </div>
          </div>
          <Link to="/dashboard/audit-log" className="gradient-dark-orange-blue text-white font-semibold py-2 px-4 rounded-2xl mt-4 inline-block text-sm hover:shadow-lg transition-all">
            View Activity Log →
          </Link>
        </motion.div>

      </div>
    </motion.main>
    </>
  );
};

export default DashboardPage;
