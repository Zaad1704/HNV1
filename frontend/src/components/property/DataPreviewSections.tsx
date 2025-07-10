import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { DollarSign, Receipt, Wrench, Bell, CheckCircle, Activity, Filter } from 'lucide-react';

interface DataPreviewProps {
  propertyId: string;
  selectedUnit?: string;
}

const DataPreviewSections: React.FC<DataPreviewProps> = ({ propertyId, selectedUnit }) => {
  const [unitFilter, setUnitFilter] = useState<string>('');

  const { data: previews, isLoading } = useQuery({
    queryKey: ['propertyDataPreviews', propertyId, unitFilter],
    queryFn: async () => {
      const params = unitFilter ? `?unit=${unitFilter}` : '';
      const { data } = await apiClient.get(`/properties/${propertyId}/data-previews${params}`);
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="app-surface rounded-3xl p-6 border border-app-border animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="space-y-2">
              {[1,2,3].map(j => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!previews) return null;

  return (
    <div className="space-y-8">
      {/* Unit Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">Filter by Unit:</span>
        </div>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Units</option>
          <option value="1">Unit 1</option>
          <option value="2">Unit 2</option>
          <option value="3">Unit 3</option>
          <option value="4">Unit 4</option>
          <option value="5">Unit 5</option>
        </select>
      </div>

      {/* Data Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payments Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Recent Payments</h3>
                <p className="text-sm text-text-secondary">{previews.payments?.length || 0} payments</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/payments?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.payments?.slice(0, 3).map((payment: any) => (
              <div key={payment._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{payment.tenant?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">
                    {payment.rentMonth} • {payment.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${payment.amount}</p>
                  <p className={`text-xs ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>

        {/* Receipts Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Receipt size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Recent Receipts</h3>
                <p className="text-sm text-text-secondary">{previews.receipts?.length || 0} receipts</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/receipts?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.receipts?.slice(0, 3).map((receipt: any) => (
              <div key={receipt._id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">#{receipt.receiptNumber}</p>
                  <p className="text-xs text-gray-600">
                    {receipt.tenant?.name || 'Unknown'} • {receipt.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">${receipt.amount}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(receipt.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent receipts</p>
            )}
          </div>
        </div>

        {/* Expenses Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Recent Expenses</h3>
                <p className="text-sm text-text-secondary">{previews.expenses?.length || 0} expenses</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/expenses?propertyId=${propertyId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.expenses?.slice(0, 3).map((expense: any) => (
              <div key={expense._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{expense.description}</p>
                  <p className="text-xs text-gray-600">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">${expense.amount}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent expenses</p>
            )}
          </div>
        </div>

        {/* Maintenance Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Maintenance</h3>
                <p className="text-sm text-text-secondary">{previews.maintenance?.length || 0} requests</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/maintenance?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.maintenance?.slice(0, 3).map((maintenance: any) => (
              <div key={maintenance._id} className="p-3 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{maintenance.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    maintenance.status === 'Open' ? 'bg-red-100 text-red-800' :
                    maintenance.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {maintenance.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">
                    {maintenance.tenant?.name || 'Property'} • {maintenance.priority}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(maintenance.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No maintenance requests</p>
            )}
          </div>
        </div>

        {/* Reminders Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Reminders</h3>
                <p className="text-sm text-text-secondary">{previews.reminders?.length || 0} active</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/reminders?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.reminders?.slice(0, 3).map((reminder: any) => (
              <div key={reminder._id} className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{reminder.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reminder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 capitalize">{reminder.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(reminder.nextRunDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No active reminders</p>
            )}
          </div>
        </div>

        {/* Approvals Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Approvals</h3>
                <p className="text-sm text-text-secondary">{previews.approvals?.length || 0} requests</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/approvals?propertyId=${propertyId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.approvals?.slice(0, 3).map((approval: any) => (
              <div key={approval._id} className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{approval.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {approval.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 capitalize">
                    {approval.type.replace('_', ' ')} • {approval.priority}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(approval.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No approval requests</p>
            )}
          </div>
        </div>

        {/* Audit Logs Preview */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Activity Logs</h3>
                <p className="text-sm text-text-secondary">{previews.auditLogs?.length || 0} recent</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/audit?propertyId=${propertyId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.auditLogs?.slice(0, 3).map((log: any) => (
              <div key={log._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{log.action}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.severity === 'low' ? 'bg-green-100 text-green-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">
                    {log.user?.name || 'System'} • {log.resource}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewSections;