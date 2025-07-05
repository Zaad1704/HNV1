import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Plus, Calendar, User, Clock } from 'lucide-react';
import apiClient from '../api/client';

const fetchReminders = async () => {
  try {
    const { data } = await apiClient.get('/reminders');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return [];
  }
};

const RemindersPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading reminders...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Reminders</h1>
          <p className="text-text-secondary mt-1">Manage automated reminders</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Reminder
        </button>
      </div>

      {reminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reminders.map((reminder: any, index: number) => (
            <motion.div
              key={reminder._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
                  <Bell size={24} className="text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  reminder.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {reminder.status || 'Active'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {reminder.title || 'Rent Reminder'}
              </h3>
              
              <p className="text-text-secondary mb-4">
                {reminder.message || 'Automated rent payment reminder'}
              </p>
              
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{reminder.tenantId?.name || 'All Tenants'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{reminder.frequency || 'Monthly'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Next: {reminder.nextSend ? new Date(reminder.nextSend).toLocaleDateString() : 'Not scheduled'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Reminders Set</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Set up automated reminders to keep tenants informed about rent payments and important dates.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Create First Reminder
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RemindersPage;