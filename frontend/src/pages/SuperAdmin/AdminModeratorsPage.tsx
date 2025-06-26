import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { motion } from 'framer-motion';
import { Users, Plus, Shield, Mail, Calendar } from 'lucide-react';

const fetchModerators = async () => {
  const { data } = await apiClient.get('/super-admin/moderators');
  return data.data;
};

const AdminModeratorsPage = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: moderators, isLoading } = useQuery({
    queryKey: ['moderators'],
    queryFn: fetchModerators
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading moderators...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Moderators</h1>
          <p className="text-text-secondary mt-1">Manage platform moderators</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Moderator
        </button>
      </div>

      {moderators && moderators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moderators.map((moderator: any, index: number) => (
            <motion.div
              key={moderator._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                  {moderator.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{moderator.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {moderator.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Mail size={14} />
                  <span>{moderator.email}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Calendar size={14} />
                  <span>Joined: {new Date(moderator.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Shield size={14} />
                  <span>Status: {moderator.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-app-bg hover:bg-app-border text-text-primary py-2 px-4 rounded-xl text-sm font-medium transition-colors">
                  Edit
                </button>
                <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-xl text-sm font-medium transition-colors">
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Moderators Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Add moderators to help manage the platform.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add First Moderator
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminModeratorsPage;