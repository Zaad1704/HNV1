import React, { useState } from 'react';
import { X, Download, FileText, Calendar, DollarSign, Users, BarChart3 } from 'lucide-react';

interface PropertyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  tenants: any[];
}

const PropertyReportModal: React.FC<PropertyReportModalProps> = ({
  isOpen,
  onClose,
  property,
  tenants
}) => {
  const [reportType, setReportType] = useState<'financial' | 'occupancy' | 'tenant' | 'comprehensive'>('comprehensive');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      icon: FileText,
      description: 'Complete property overview with all metrics',
      includes: ['Financial summary', 'Occupancy details', 'Tenant information', 'Payment history']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      icon: DollarSign,
      description: 'Revenue, expenses, and financial performance',
      includes: ['Revenue breakdown', 'Payment history', 'Outstanding amounts', 'Profit/Loss']
    },
    {
      id: 'occupancy',
      name: 'Occupancy Report',
      icon: BarChart3,
      description: 'Unit occupancy and vacancy analysis',
      includes: ['Occupancy rates', 'Vacant units', 'Lease expiry dates', 'Turnover analysis']
    },
    {
      id: 'tenant',
      name: 'Tenant Report',
      icon: Users,
      description: 'Detailed tenant information and history',
      includes: ['Tenant profiles', 'Lease details', 'Payment status', 'Contact information']
    }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create mock report data
      const reportData = {
        property: property.name,
        reportType,
        dateRange,
        generatedAt: new Date().toISOString(),
        data: {
          totalUnits: property.numberOfUnits,
          occupiedUnits: tenants.filter(t => t.status === 'Active').length,
          totalRevenue: tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0),
          tenants: tenants.map(t => ({
            name: t.name,
            unit: t.unit,
            rentAmount: t.rentAmount,
            status: t.status
          }))
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${property.name}_${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Report generated and downloaded successfully!');
      onClose();
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generate Property Report</h2>
              <p className="text-sm text-gray-600">{property.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Select Report Type</h3>
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      reportType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.id}
                      checked={reportType === type.id}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <type.icon size={20} className="text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{type.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{type.description}</div>
                        <div className="text-xs text-gray-500">
                          Includes: {type.includes.join(', ')}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Export Format</h3>
              <div className="flex gap-3">
                {[
                  { id: 'pdf', name: 'PDF', description: 'Formatted document' },
                  { id: 'excel', name: 'Excel', description: 'Spreadsheet format' },
                  { id: 'csv', name: 'CSV', description: 'Data export' }
                ].map((fmt) => (
                  <label
                    key={fmt.id}
                    className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                      format === fmt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt.id}
                      checked={format === fmt.id}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="font-medium">{fmt.name}</div>
                    <div className="text-xs text-gray-600">{fmt.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium ml-2">{property.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium ml-2">{reportTypes.find(t => t.id === reportType)?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium ml-2">
                    {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium ml-2">{format.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={16} />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyReportModal;