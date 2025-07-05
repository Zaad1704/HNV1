import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, User, Calendar, Activity, Filter, Search } from 'lucide-react';
import apiClient from '../api/client';

const fetchAuditLogs = async () => {
  try {
    const { data } = await apiClient.get('/audit-logs');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
};

const AuditLogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: fetchAuditLogs,
    retry: 1
  });

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = !searchQuery || 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    if (action?.includes('create')) return '+';
    if (action?.includes('update')) return '✏️';
    if (action?.includes('delete')) return '🗑️';
    if (action?.includes('login')) return '🔐';
    return '📝';
  };

  const getActionColor = (action: string) => {
    if (action?.includes('create')) return 'bg-green-100 text-green-800';
    if (action?.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action?.includes('delete')) return 'bg-red-100 text-red-800';
    if (action?.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading audit logs...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Audit Log</h1>
        <p className="text-text-secondary mt-1">View system activity and changes</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-app-border rounded-xl"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-app-border rounded-xl"
        >
          <option value="">All Activities</option>
          <option value="user">User Actions</option>
          <option value="property">Property Changes</option>
          <option value="payment">Payment Activities</option>
          <option value="system">System Events</option>
        </select>
      </div>

      {/* Activity Timeline */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        {filteredLogs.length > 0 ? (
          <div className="space-y-4">
            {filteredLogs.map((log: any, index: number) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-app-bg rounded-xl hover:shadow-app transition-all"
              >
                <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center text-white font-bold">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action || 'Unknown Action'}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No timestamp'}
                    </span>
                  </div>
                  
                  <p className="text-text-primary font-medium mb-1">
                    {log.description || `${log.action} performed`}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{log.user?.name || 'System'}</span>
                    </div>
                    {log.ipAddress && (
                      <div className="flex items-center gap-1">
                        <Activity size={14} />
                        <span>{log.ipAddress}</span>
                      </div>
                    )}
                    {log.resource && (
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>{log.resource}</span>
                      </div>
                    )}
                  </div>
                  
                  {log.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                        View Details
                      </summary>
                      <pre className="text-xs text-text-secondary mt-1 p-2 bg-app-surface rounded border overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">No Activity Logs</h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              System activities and user actions will appear here as they occur.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AuditLogPage;