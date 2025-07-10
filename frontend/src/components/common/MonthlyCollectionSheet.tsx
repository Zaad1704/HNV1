import React, { useState } from 'react';
import { X, Calendar, Download, FileText, Building2 } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

interface MonthlyCollectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProperty?: string;
}

const MonthlyCollectionSheet: React.FC<MonthlyCollectionSheetProps> = ({ isOpen, onClose, preSelectedProperty }) => {
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const [selectedProperty, setSelectedProperty] = useState(preSelectedProperty || '');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Fetch collection data
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        ...(selectedProperty && { propertyId: selectedProperty })
      });
      
      const { data } = await apiClient.get(`/reports/collection-sheet?${params}`);
      const collectionData = data.data || [];
      
      // Generate PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const organizationName = user?.organization?.name || user?.name + "'s Organization" || "Your Organization";
      const monthName = months[selectedMonth - 1];
      const propertyName = selectedProperty ? properties.find(p => p._id === selectedProperty)?.name : 'All Properties';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Collection Sheet - ${monthName} ${selectedYear}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .footer { text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-style: italic; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .summary { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .paid { color: green; font-weight: bold; }
              .pending { color: orange; font-weight: bold; }
              .overdue { color: red; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${organizationName}</h1>
              <h2>Monthly Collection Sheet</h2>
              <p><strong>${monthName} ${selectedYear} - ${propertyName}</strong></p>
              <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p><strong>Powered by HNV Property Management Solutions</strong></p>
            </div>
            
            <div class="summary">
              <h3>Collection Summary</h3>
              <p><strong>Total Expected:</strong> ${currency}${collectionData.reduce((sum: number, item: any) => sum + (item.rentAmount || 0), 0).toLocaleString()}</p>
              <p><strong>Total Collected:</strong> ${currency}${collectionData.reduce((sum: number, item: any) => sum + (item.paidAmount || 0), 0).toLocaleString()}</p>
              <p><strong>Outstanding:</strong> ${currency}${collectionData.reduce((sum: number, item: any) => sum + ((item.rentAmount || 0) - (item.paidAmount || 0)), 0).toLocaleString()}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Property</th>
                  <th>Unit</th>
                  <th>Rent Amount</th>
                  <th>Paid Amount</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                ${collectionData.map((item: any) => {
                  const outstanding = (item.rentAmount || 0) - (item.paidAmount || 0);
                  const status = outstanding === 0 ? 'Paid' : outstanding > 0 ? 'Pending' : 'Overpaid';
                  const statusClass = status === 'Paid' ? 'paid' : status === 'Pending' ? 'pending' : 'overdue';
                  
                  return `
                    <tr>
                      <td>${item.tenantName || 'N/A'}</td>
                      <td>${item.propertyName || 'N/A'}</td>
                      <td>${item.unit || 'N/A'}</td>
                      <td>${currency}${(item.rentAmount || 0).toLocaleString()}</td>
                      <td>${currency}${(item.paidAmount || 0).toLocaleString()}</td>
                      <td>${currency}${outstanding.toLocaleString()}</td>
                      <td class="${statusClass}">${status}</td>
                      <td>${item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p><strong>Total Records: ${collectionData.length}</strong></p>
              <p>Report generated by HNV Property Management Solutions</p>
              <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} HNV Property Management Solutions. All rights reserved.</p>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      alert('Collection sheet generated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to generate collection sheet:', error);
      alert('Failed to generate collection sheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Collection Sheet</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Property (Optional)
            </label>
            <div className="relative">
              <Building2 size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Properties</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month and Year Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Collection Sheet will include:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• All tenant payment records</li>
              <li>• Outstanding balances</li>
              <li>• Payment status summary</li>
              <li>• Monthly collection totals</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate Sheet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCollectionSheet;