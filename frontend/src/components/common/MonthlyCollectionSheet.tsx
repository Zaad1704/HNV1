import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface MonthlyCollectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonthlyCollectionSheet: React.FC<MonthlyCollectionSheetProps> = ({ isOpen, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [checkedTenants, setCheckedTenants] = useState<Set<string>>(new Set());

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants', selectedMonth],
    queryFn: async () => {
      const { data } = await apiClient.get('/tenants');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: payments } = useQuery({
    queryKey: ['payments', selectedMonth],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payments?month=${selectedMonth}`);
      return data.data || [];
    },
    enabled: isOpen
  });

  const getPaymentStatus = (tenantId: string) => {
    const payment = payments?.find((p: any) => 
      p.tenantId === tenantId && 
      new Date(p.paymentDate).toISOString().slice(0, 7) === selectedMonth
    );
    return payment ? 'paid' : 'pending';
  };

  const getPastDueMonths = (tenantId: string) => {
    // Mock calculation - in real app, check payment history
    const currentDate = new Date();
    const selectedDate = new Date(selectedMonth);
    const monthsDiff = (currentDate.getFullYear() - selectedDate.getFullYear()) * 12 + 
                      (currentDate.getMonth() - selectedDate.getMonth());
    
    if (monthsDiff > 0 && getPaymentStatus(tenantId) === 'pending') {
      return monthsDiff;
    }
    return 0;
  };

  const handleTenantCheck = (tenantId: string) => {
    const newChecked = new Set(checkedTenants);
    if (newChecked.has(tenantId)) {
      newChecked.delete(tenantId);
    } else {
      newChecked.add(tenantId);
    }
    setCheckedTenants(newChecked);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="app-surface rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-app-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FileText size={24} className="text-purple-500" />
            Monthly Collection Sheet
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-app-bg">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Select Month
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-3 border border-app-border rounded-xl bg-app-surface text-text-primary"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 app-gradient rounded-full animate-pulse mx-auto mb-3"></div>
            <p className="text-text-secondary">Loading collection sheet...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-app-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedTenants(new Set(tenants?.map((t: any) => t._id) || []));
                        } else {
                          setCheckedTenants(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Tenant</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Unit</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Rent Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Past Due</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {tenants?.map((tenant: any) => {
                  const paymentStatus = getPaymentStatus(tenant._id);
                  const pastDueMonths = getPastDueMonths(tenant._id);
                  
                  return (
                    <tr key={tenant._id} className="hover:bg-app-bg transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={checkedTenants.has(tenant._id)}
                          onChange={() => handleTenantCheck(tenant._id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 app-gradient rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{tenant.name}</p>
                            <p className="text-sm text-text-secondary">{tenant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-text-primary font-medium">
                        {tenant.unit}
                      </td>
                      <td className="py-4 px-4 text-text-primary font-medium">
                        ${tenant.rentAmount || 0}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {paymentStatus === 'paid' ? (
                            <>
                              <Check size={16} className="text-green-500" />
                              <span className="text-green-600 font-medium">Paid</span>\n                            </>\n                          ) : (\n                            <>\n                              <AlertCircle size={16} className=\"text-red-500\" />\n                              <span className=\"text-red-600 font-medium\">Pending</span>\n                            </>\n                          )}\n                        </div>\n                      </td>\n                      <td className=\"py-4 px-4\">\n                        {pastDueMonths > 0 ? (\n                          <span className=\"px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium\">\n                            {pastDueMonths} month{pastDueMonths > 1 ? 's' : ''}\n                          </span>\n                        ) : (\n                          <span className=\"text-text-secondary text-sm\">Current</span>\n                        )}\n                      </td>\n                      <td className=\"py-4 px-4\">\n                        <input\n                          type=\"text\"\n                          placeholder=\"Add notes...\"\n                          className=\"w-full p-2 text-sm border border-app-border rounded-lg bg-app-surface text-text-primary\"\n                        />\n                      </td>\n                    </tr>\n                  );\n                })}\n              </tbody>\n            </table>\n          </div>\n        )}\n\n        <div className=\"flex justify-between items-center mt-6 pt-4 border-t border-app-border\">\n          <div className=\"text-sm text-text-secondary\">\n            {checkedTenants.size} of {tenants?.length || 0} tenants selected\n          </div>\n          <div className=\"flex gap-3\">\n            <button\n              onClick={onClose}\n              className=\"px-4 py-2 bg-app-bg text-text-primary rounded-xl hover:bg-app-border transition-colors\"\n            >\n              Close\n            </button>\n            <button className=\"px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors\">\n              Export Sheet\n            </button>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default MonthlyCollectionSheet;