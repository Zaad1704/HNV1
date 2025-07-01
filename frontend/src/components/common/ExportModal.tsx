import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Table, Settings, Filter } from 'lucide-react';
import apiClient from '../../api/client';
import { useMutation } from '@tanstack/react-query';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'properties' | 'tenants' | 'payments' | 'maintenance' | 'expenses';
  title: string;
}

interface ExportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  properties?: string[];
  status?: string[];
}

interface ExportOptions {
  includeImages?: boolean;
  includeDocuments?: boolean;
  groupBy?: string;
  sortBy?: string;
  columns?: string[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, section, title }) => {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [filters, setFilters] = useState<ExportFilters>({});
  const [options, setOptions] = useState<ExportOptions>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const exportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/export/request', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Start polling for export status
      pollExportStatus(data.data._id);
    },
    onError: (error: any) => {
      alert(`Export failed: ${error.response?.data?.message || error.message}`);
    }
  });

  const pollExportStatus = async (exportId: string) => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.get(`/export/status/${exportId}`);
        const exportData = response.data.data;

        if (exportData.status === 'completed') {
          // Download the file
          window.open(`/api/export/download/${exportId}`, '_blank');
          onClose();
        } else if (exportData.status === 'failed') {
          alert(`Export failed: ${exportData.error?.message || 'Unknown error'}`);
        } else {
          // Continue polling
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error('Error checking export status:', error);
      }
    };

    checkStatus();
  };

  const handleExport = () => {
    exportMutation.mutate({
      type: section,
      format,
      filters,
      options
    });
  };

  const getAvailableColumns = () => {
    const columnMaps: Record<string, string[]> = {
      properties: ['name', 'address', 'units', 'status', 'rent', 'occupancy'],
      tenants: ['name', 'email', 'phone', 'property', 'lease_start', 'lease_end', 'rent'],
      payments: ['date', 'tenant', 'property', 'amount', 'method', 'status'],
      maintenance: ['title', 'property', 'priority', 'status', 'created_date'],
      expenses: ['description', 'amount', 'category', 'date', 'property']
    };

    return columnMaps[section] || [];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-2xl border border-gray-200"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Download size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export {title}</h2>
                <p className="text-sm text-gray-500">Download your data in PDF or CSV format</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('pdf')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    format === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText size={24} className="mx-auto mb-2" />
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-gray-500">Formatted document</div>
                </button>
                <button
                  onClick={() => setFormat('csv')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    format === 'csv'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Table size={24} className="mx-auto mb-2" />
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-gray-500">Spreadsheet data</div>
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Date Range (Optional)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Settings size={16} />
                Advanced Options
              </button>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={options.sortBy || ''}
                      onChange={(e) => setOptions(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl"
                    >
                      <option value="">Default</option>
                      <option value="name">Name</option>
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                    <select
                      value={options.groupBy || ''}
                      onChange={(e) => setOptions(prev => ({ ...prev, groupBy: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl"
                    >
                      <option value="">No Grouping</option>
                      <option value="property">Property</option>
                      <option value="date">Date</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.includeImages || false}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Include Images</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.includeDocuments || false}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeDocuments: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Include Documents</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
            >
              {exportMutation.isPending ? 'Exporting...' : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;