import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Plus, Calendar, User, Clock, Download, Sparkles, Archive, Eye } from 'lucide-react';
import apiClient from '../api/client';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import CreateReminderModal from '../components/common/CreateReminderModal';
import MessageButtons from '../components/common/MessageButtons';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
    retry: 1
  });

  const handleReminderAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Reminders
            </span>
            <Sparkles size={28} className="text-brand-orange animate-pulse" />
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-text-secondary">
              Manage automated reminders ({reminders.length} active)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Show:</span>
              <button
                onClick={() => setShowArchived(false)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  !showArchived 
                    ? 'bg-blue-100 text-blue-800 shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eye size={12} className="inline mr-1" />
                Active ({reminders.filter(r => r.status === 'active').length})
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={14} className="text-white" />
            </div>
            Create Reminder
          </button>
        </div>
      </div>

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search reminders..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'Active', label: 'Active' },
          { value: 'Paused', label: 'Paused' },
          { value: 'Completed', label: 'Completed' }
        ]}
      />

      {reminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((reminder: any, index: number) => (
            <motion.div
              key={reminder._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden backdrop-blur-sm"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
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
              
              <div className="mt-4">
                <MessageButtons
                  phone={reminder.tenantId?.phone}
                  email={reminder.tenantId?.email}
                  name={reminder.tenantId?.name || 'All Tenants'}
                  customMessage={reminder.message || 'Automated reminder notification'}
                />
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
            className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
          >
            <Plus size={16} />
            Create First Reminder
          </button>
        </div>
      )}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={reminders}
        filename="reminders"
        filters={searchFilters}
        title="Export Reminders"
      />
      
      <CreateReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onReminderCreated={handleReminderAdded}
      />
    </motion.div>
  );
};

export default RemindersPage;