import { useState } from 'react';
import apiClient from '../api/client';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  fields?: string[];
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportData = async (endpoint: string, filename: string, options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiClient.post(`/api/export/${endpoint}`, options, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setExportProgress(progress);
          }
        }
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${options.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportProperties = (options: ExportOptions) => {
    return exportData('properties', 'properties', options);
  };

  const exportTenants = (options: ExportOptions) => {
    return exportData('tenants', 'tenants', options);
  };

  const exportPayments = (options: ExportOptions) => {
    return exportData('payments', 'payments', options);
  };

  const exportExpenses = (options: ExportOptions) => {
    return exportData('expenses', 'expenses', options);
  };

  const exportMaintenanceRequests = (options: ExportOptions) => {
    return exportData('maintenance', 'maintenance-requests', options);
  };

  const exportFinancialReport = (options: ExportOptions) => {
    return exportData('financial-report', 'financial-report', options);
  };

  return {
    isExporting,
    exportProgress,
    exportProperties,
    exportTenants,
    exportPayments,
    exportExpenses,
    exportMaintenanceRequests,
    exportFinancialReport
  };
};