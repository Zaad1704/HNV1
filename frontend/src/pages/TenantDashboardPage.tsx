import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  DollarSign,
  Clock,
  FileText
} from 'lucide-react';

const fetchTenantDashboard = async () => {
  const { data } = await apiClient.get('/tenant-portal/dashboard');
  return data.data;
};

const TenantDashboardPage = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['tenantDashboard'],
    queryFn: fetchTenantDashboard
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <FileText size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to Load Dashboard</h3>
        <p className="text-text-secondary">Please contact your landlord to set up your tenant profile.</p>
      </div>
    );
  }

  const { leaseInfo, paymentHistory, upcomingDues } = dashboardData || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="app-gradient rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Portal</h1>
        <p className="text-white/80">
          Manage your lease, payments, and communicate with your landlord.
        </p>
      </div>

      {/* Property & Lease Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Your Property</h2>
          </div>
          
          {leaseInfo && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-text-muted mt-1" />
                <div>
                  <p className="font-semibold text-text-primary">
                    {leaseInfo.property?.name}
                  </p>
                  <p className="text-text-secondary text-sm">
                    Unit {leaseInfo.unit} • {leaseInfo.property?.street}, {leaseInfo.property?.city}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-text-muted" />
                <div>
                  <p className="font-semibold text-text-primary">
                    ${leaseInfo.rentAmount?.toLocaleString()}/month
                  </p>
                  <p className="text-text-secondary text-sm">Monthly Rent</p>
                </div>
              </div>
              
              {leaseInfo.leaseEndDate && (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-text-muted" />
                  <div>
                    <p className="font-semibold text-text-primary">
                      {new Date(leaseInfo.leaseEndDate).toLocaleDateString()}
                    </p>
                    <p className="text-text-secondary text-sm">Lease Expires</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Landlord Contact</h2>
          </div>
          
          {leaseInfo?.landlord && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-muted" />
                <div>
                  <p className="font-semibold text-text-primary">
                    {leaseInfo.landlord.name}
                  </p>
                  <p className="text-text-secondary text-sm">Property Manager</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-text-muted" />
                <div>
                  <p className="font-semibold text-text-primary">
                    {leaseInfo.landlord.email}
                  </p>
                  <p className="text-text-secondary text-sm">Email</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Payments */}
      {upcomingDues && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Upcoming Payment</h2>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-lg font-bold text-orange-800">
                  ${upcomingDues.totalAmount?.toLocaleString()}
                </p>
                <p className="text-orange-600 text-sm">
                  Due: {new Date(upcomingDues.dueDate).toLocaleDateString()}
                </p>
              </div>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
            
            {upcomingDues.lineItems && upcomingDues.lineItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-800">Payment Details:</p>
                {upcomingDues.lineItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm text-orange-700">
                    <span>{item.description}</span>
                    <span>${item.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="app-surface rounded-3xl p-8 border border-app-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
            <CreditCard size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Recent Payments</h2>
        </div>
        
        {paymentHistory && paymentHistory.length > 0 ? (
          <div className="space-y-4">
            {paymentHistory.slice(0, 5).map((payment: any) => (
              <div key={payment._id} className="flex justify-between items-center p-4 bg-app-bg rounded-2xl">
                <div>
                  <p className="font-semibold text-text-primary">
                    ${payment.amount?.toLocaleString()}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard size={48} className="mx-auto text-text-muted mb-4" />
            <p className="text-text-secondary">No payment history available</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TenantDashboardPage;
