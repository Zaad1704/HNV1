import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, DollarSign, TrendingUp, Bell, Calendar, Settings, BarChart3, Lock, Sparkles, Crown, Shield, Activity, Eye, MessageCircle, Share2 } from 'lucide-react';
import apiClient from '../api/client';
import { useCurrency } from '../contexts/CurrencyContext';
import DashboardMonitor from '../components/dashboard/DashboardMonitor';
import { SkeletonStats } from '../components/common/SkeletonLoader';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';
import ViewOnlyDashboard from '../components/dashboard/ViewOnlyDashboard';
import FloatingHelpCenter from '../components/common/FloatingHelpCenter';
import FloatingQuickActions from '../components/common/FloatingQuickActions';
import RoleBasedDashboard from '../components/dashboard/RoleBasedDashboard';
import { useAuthStore } from '../store/authStore';
import { useQuery as useSubscriptionQuery } from '@tanstack/react-query';

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch dashboard stats:', error);
    }
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
  const { user, fetchUserData } = useAuthStore();
  const [showRestrictionOverlay, setShowRestrictionOverlay] = React.useState(true);
  
  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  React.useEffect(() => {
    if (hasRestrictedAccess) {
      setShowRestrictionOverlay(true);
    }
  }, [hasRestrictedAccess]);
  
  // Get subscription status
  const { data: subscriptionStatus } = useSubscriptionQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/subscription/status');
      return data.data;
    },
    enabled: !!user?.organizationId
  });
  

  
  // Check if user has restricted access (comprehensive check including super admin actions)
  const hasRestrictedAccess = user && (
    // User-level restrictions
    user.status === 'pending' || 
    user.status === 'suspended' || 
    !user.isEmailVerified ||
    !user.organizationId ||
    
    // Organization-level restrictions (super admin actions)
    (user.organization && user.organization.status === 'inactive') ||
    (user.organization && user.organization.status === 'pending_deletion') ||
    
    // Subscription-level restrictions
    (user.subscription && (
      user.subscription.status === 'inactive' ||
      user.subscription.status === 'canceled' ||
      user.subscription.status === 'past_due' ||
      user.subscription.status === 'expired' ||
      (user.subscription.canceledAt && new Date(user.subscription.canceledAt) < new Date()) ||
      (user.subscription.trialExpiresAt && new Date(user.subscription.trialExpiresAt) < new Date()) ||
      (user.subscription.currentPeriodEndsAt && new Date(user.subscription.currentPeriodEndsAt) < new Date() && !user.subscription.isLifetime)
    ))
  );
  
  // Additional safety check
  if (!user) {

    return <Navigate to="/login" replace />;
  }
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    enabled: !!user && !!user.organizationId, // Only fetch if user has organization
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



  if (isLoading && !stats) {

    return (
      <div className="p-6 pt-0">
        <SkeletonStats />
      </div>
    );
  }

  if (error && !stats) {
    // Don't show empty dashboard, show error state but keep dashboard layout
    
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
  


  return (
    <>
      {/* Restriction Overlay */}
      {hasRestrictedAccess && showRestrictionOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Your account has limited access. Please reactivate your subscription to unlock all features.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard/billing" className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
                Reactivate Subscription
              </Link>
              <button 
                onClick={() => setShowRestrictionOverlay(false)}
                className="px-6 py-3 rounded-2xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View Dashboard (Limited)
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription Status Banner */}
      {subscriptionStatus?.status === 'trialing' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 font-medium">Trial Active</p>
              <p className="text-blue-600 text-sm">
                {subscriptionStatus.expiresAt 
                  ? `Trial expires on ${new Date(subscriptionStatus.expiresAt).toLocaleDateString()}`
                  : 'Enjoying your trial?'
                }
              </p>
            </div>
            <Link to="/dashboard/billing" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
      
      <DashboardMonitor />
      <FloatingHelpCenter />
      <FloatingQuickActions />
      <motion.main
        className={`dashboard-container p-6 pt-0 ${isLoading && stats ? 'opacity-90' : ''} ${hasRestrictedAccess ? 'pointer-events-none opacity-75' : ''}`}
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
      {/* Role-based Dashboard */}
      <RoleBasedDashboard stats={dashboardStats} />
      
      {/* Default Landlord Dashboard */}
      {user?.role === 'Landlord' && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="gradient-dark-orange-blue rounded-3xl p-8 sm:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between text-white relative overflow-hidden"
          variants={cardVariants}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center shadow-xl">
                <BarChart3 size={32} className="text-white" />
              </div>
              <Sparkles size={24} className="text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold leading-tight mb-2">Dashboard</h1>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={20} className="text-yellow-300" />
              <span className="text-yellow-300 font-semibold">{user?.role || 'User'} Portal</span>
            </div>
            <p className="text-white/90 mt-4 max-w-sm text-lg leading-relaxed">Welcome to your comprehensive property management hub. Access all your tools, insights, and communications from here.</p>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-white/80" />
                  <p className="text-white/80 text-sm font-medium">Properties</p>
                </div>
                <p className="text-3xl font-bold">{dashboardStats.totalProperties}</p>
                <p className="text-white/70 text-xs mt-1">Active properties managed</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-white/80" />
                  <p className="text-white/80 text-sm font-medium">Tenants</p>
                </div>
                <p className="text-3xl font-bold">{dashboardStats.totalTenants}</p>
                <p className="text-white/70 text-xs mt-1">Total tenant relationships</p>
              </div>
            </div>
            
            {/* Role-specific Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              {user?.role === 'Landlord' && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  <Shield size={12} />
                  Full Access
                </div>
              )}
              {user?.role === 'Agent' && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  <Eye size={12} />
                  {user?.managedProperties?.length || 0} Properties Assigned
                </div>
              )}
              {user?.role === 'Tenant' && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  <Users size={12} />
                  Tenant Portal
                </div>
              )}
            </div>
          </div>
          <div className="relative z-10 flex gap-3 mt-8">
            <Link to="/dashboard/properties" className="bg-white text-brand-orange font-bold py-4 px-8 rounded-2xl text-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Building2 size={16} />
              View Properties
            </Link>
            {user?.role !== 'Tenant' && (
              <Link to="/dashboard/tenants" className="bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl text-sm hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center gap-2">
                <Users size={16} />
                Tenants
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div className="group app-surface border border-app-border rounded-3xl p-6 flex flex-col hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/30 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden" variants={cardVariants} custom={1} initial="hidden" animate="visible">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <DollarSign size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary group-hover:text-green-600 transition-colors">Monthly Revenue</h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mt-3">
              {currency}{dashboardStats.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-text-secondary text-sm mt-3 flex-grow">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} earnings
            </p>
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 text-green-800">
                <TrendingUp size={14} />
                <span className="text-xs font-medium">Revenue Tracking Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="group app-surface border border-app-border rounded-3xl p-6 flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden" variants={cardVariants} custom={2} initial="hidden" animate="visible">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary group-hover:text-blue-600 transition-colors">Occupancy Rate</h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mt-3">{dashboardStats.occupancyRate}%</p>
            <p className="text-text-secondary text-sm mt-3 flex-grow">
              {dashboardStats.totalTenants} of {Math.max(dashboardStats.totalProperties, 1)} units occupied
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${dashboardStats.occupancyRate}%` }}
                ></div>
              </div>
            </div>
            
            <Link to="/dashboard/properties" className="gradient-dark-orange-blue text-white font-semibold py-3 px-6 rounded-2xl mt-4 self-start text-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Building2 size={14} />
              View Properties
            </Link>
          </div>
        </motion.div>
        
        <motion.div className="gradient-orange-blue rounded-3xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300" style={{ transform: 'rotate(-1deg)'}} variants={cardVariants} custom={3} initial="hidden" animate="visible">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/25 rounded-2xl mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Bell size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Maintenance</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                dashboardStats.pendingMaintenance > 0 ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'
              }`}></div>
              <p className="text-white/90 text-sm font-medium">
                {dashboardStats.pendingMaintenance} {dashboardStats.pendingMaintenance === 1 ? 'request' : 'requests'} pending
              </p>
            </div>
            <p className="text-white/70 text-xs mb-4">
              {dashboardStats.pendingMaintenance === 0 ? 'All caught up!' : 'Requires attention'}
            </p>
            <Link to="/dashboard/maintenance" className="bg-white text-brand-orange px-4 py-2 rounded-2xl text-sm font-bold inline-flex items-center gap-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Activity size={14} />
              View All
            </Link>
          </div>
        </motion.div>

        <motion.div className="group app-surface border border-app-border rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue/30 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden" variants={cardVariants} custom={4} initial="hidden" animate="visible">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 gradient-dark-orange-blue rounded-3xl mb-6 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">H</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-2">
                HNV Platform
            </h2>
            <p className="text-text-secondary text-sm mb-4">Property Management Solutions</p>
            <div className="flex items-center gap-2 justify-center">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-800">System Online</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-center">
              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <MessageCircle size={16} className="text-blue-600" />
              </button>
              <button className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                <Share2 size={16} className="text-purple-600" />
              </button>
            </div>
          </div>
        </motion.div>
        
        <motion.div className="group app-surface border border-app-border rounded-3xl p-8 sm:col-span-2 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden" variants={cardVariants} custom={5} initial="hidden" animate="visible">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-purple-600 font-bold text-sm uppercase tracking-wide">Recent Activity</h3>
                <h2 className="text-3xl font-bold text-text-primary group-hover:text-purple-600 transition-colors">Latest Updates</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-800 text-lg">
                    {dashboardStats.recentPayments} new {dashboardStats.recentPayments === 1 ? 'payment' : 'payments'}
                  </p>
                  <p className="text-green-600 text-sm font-medium">
                    {dashboardStats.recentPayments > 0 ? 'Received in the last 24 hours' : 'No recent payments'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  dashboardStats.recentPayments > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
              </div>
              
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-800 text-lg">Tenant portal active</p>
                  <p className="text-blue-600 text-sm font-medium">All tenants can access their accounts</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Role-specific Activity */}
              {user?.role === 'Landlord' && (
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-purple-800 text-lg">Full system access</p>
                    <p className="text-purple-600 text-sm font-medium">All features and sections available</p>
                  </div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              )}
              
              {user?.role === 'Agent' && (
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-orange-800 text-lg">Agent dashboard active</p>
                    <p className="text-orange-600 text-sm font-medium">{user?.managedProperties?.length || 0} properties assigned</p>
                  </div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Link to="/dashboard/audit-log" className="gradient-dark-orange-blue text-white font-bold py-3 px-6 rounded-2xl text-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Activity size={16} />
                View Activity Log
              </Link>
              {user?.role !== 'Tenant' && (
                <Link to="/dashboard/settings" className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-2xl text-sm hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </Link>
              )}
            </div>
          </div>
        </motion.div>

      </div>
      )}
    </motion.main>
    </>
  );
};

export default DashboardPage;
