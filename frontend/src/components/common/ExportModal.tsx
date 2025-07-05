import React, { useState } from 'react';
import { X, Download, FileText, Table, FileImage } from 'lucide-react';
import { useDataExport } from '../../hooks/useDataExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  title: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, section, title }) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { exportData, isExporting } = useDataExport() || { exportData: () => {}, isExporting: false };

  const handleExport = async () => {
    try {
      await exportData(section, `${section}-export`, {
        format,
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export {title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'xlsx', label: 'Excel', icon: Table },
                { value: 'csv', label: 'CSV', icon: FileText },
                { value: 'pdf', label: 'PDF', icon: FileImage }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value as any)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    format === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon size={20} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;