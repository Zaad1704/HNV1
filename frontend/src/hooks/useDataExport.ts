import { useState } from 'react';
import apiClient from '../api/client';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: any;
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (type: string, options: ExportOptions) => {
    setIsExporting(true);
    try {
      const response = await apiClient.post(`/export/${type}`, options, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = options.format;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${type}-export-${timestamp}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const exportProperties = (options: ExportOptions) => exportData('properties', options);
  const exportTenants = (options: ExportOptions) => exportData('tenants', options);
  const exportPayments = (options: ExportOptions) => exportData('payments', options);
  const exportFinancials = (options: ExportOptions) => exportData('financials', options);

  return {
    isExporting,
    exportProperties,
    exportTenants,
    exportPayments,
    exportFinancials
  };
};