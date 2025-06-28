import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Download, Printer, Check } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CollectionData {
  _id: string;
  tenantName: string;
  unitNo: string;
  rentAmount: number;
  rentStartMonth: string;
  overdueMonths: string[];
  isCollected: boolean;
  propertyName: string;
}

const fetchCollectionData = async (month: string, year: string) => {
  const { data } = await apiClient.get(`/reports/monthly-collection?month=${month}&year=${year}`);
  return data.data;
};

const MonthlyCollectionSheet = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [collectionStatus, setCollectionStatus] = useState<Record<string, boolean>>({});
  const { currency } = useCurrency();

  const { data: collectionData = [], isLoading } = useQuery({
    queryKey: ['monthlyCollection', selectedMonth, selectedYear],
    queryFn: () => fetchCollectionData(selectedMonth.toString(), selectedYear.toString()),
    enabled: isOpen
  });

  const handleCheckboxChange = (tenantId: string, checked: boolean) => {
    setCollectionStatus(prev => ({ ...prev, [tenantId]: checked }));
  };

  const downloadSheet = () => {
    const csvContent = [
      ['Tenant Name', 'Unit No', 'Property', 'Rent Amount', 'Start Month', 'Overdue Months', 'Collected'],
      ...collectionData.map((item: CollectionData) => [
        item.tenantName,
        item.unitNo,
        item.propertyName,
        `${currency}${item.rentAmount}`,
        item.rentStartMonth,
        item.overdueMonths.join(', '),
        collectionStatus[item._id] ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collection-sheet-${selectedMonth}-${selectedYear}.csv`;
    a.click();
  };

  const printSheet = () => {
    const printContent = `
      <html>
        <head>
          <title>Monthly Collection Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Monthly Collection Sheet</h2>
            <p>Month: ${selectedMonth}/${selectedYear}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tenant Name</th>
                <th>Unit No</th>
                <th>Property</th>
                <th>Rent Amount</th>
                <th>Overdue Months</th>
                <th>Collected</th>
              </tr>
            </thead>
            <tbody>
              ${collectionData.map((item: CollectionData) => `
                <tr>
                  <td>${item.tenantName}</td>
                  <td>${item.unitNo}</td>
                  <td>${item.propertyName}</td>
                  <td>${currency}${item.rentAmount}</td>
                  <td>${item.overdueMonths.join(', ')}</td>
                  <td>${collectionStatus[item._id] ? '✓' : '☐'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Powered by HNV Property Management Solutions</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Collection Sheet</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
          </div>
          <div className="flex gap-4 mt-4">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            >
              {Array.from({length: 5}, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i}>{new Date().getFullYear() - 2 + i}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border p-3 text-left">Tenant Name</th>
                  <th className="border p-3 text-left">Unit No</th>
                  <th className="border p-3 text-left">Rent Amount</th>
                  <th className="border p-3 text-left">Overdue</th>
                  <th className="border p-3 text-center">Collected</th>
                </tr>
              </thead>
              <tbody>
                {collectionData.map((item: CollectionData) => (
                  <tr key={item._id}>
                    <td className="border p-3">{item.tenantName}</td>
                    <td className="border p-3">{item.unitNo}</td>
                    <td className="border p-3">{currency}{item.rentAmount}</td>
                    <td className="border p-3">{item.overdueMonths.join(', ') || 'None'}</td>
                    <td className="border p-3 text-center">
                      <input
                        type="checkbox"
                        checked={collectionStatus[item._id] || false}
                        onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={downloadSheet} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={16} /> Download CSV
          </button>
          <button onClick={printSheet} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCollectionSheet;