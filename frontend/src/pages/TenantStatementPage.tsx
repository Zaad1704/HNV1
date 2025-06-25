// frontend/src/pages/TenantStatementPage.tsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // To get tenantId from URL
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ChevronLeft } from 'lucide-react'; // Icon for back button

// Define interfaces for statement data
interface IStatementEntry {
    month: string;
    expectedDue: number;
    amountPaid: number;
    monthlyBalance: number;
    cumulativeBalance: number;
    invoices: {
        id: string;
        invoiceNumber: string;
        amount: number;
        status: string;
        dueDate: string;
    }[];
    payments: {
        id: string;
        amount: number;
        date: string;
    }[];
}

interface ITenantStatementData {
    data: IStatementEntry[];
    tenantName: string;
}

const fetchTenantStatement = async (tenantId: string, startMonth: string, endMonth: string): Promise<ITenantStatementData> => {
    const { data } = await apiClient.get(`/reports/tenant-statement/${tenantId}`, {
        params: { startMonth, endMonth }
    });
    return data; // Assuming backend returns { success: true, data: statement, tenantName: string }
};

const TenantStatementPage: React.FC = () => {
    const { tenantId } = useParams<{ tenantId: string }>(); // Get tenantId from URL
    const today = new Date();
    const defaultEndMonth = today.toISOString().substring(0, 7); //YYYY-MM
    const defaultStartMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1).toISOString().substring(0, 7); // 12 months ago

    const [startMonth, setStartMonth] = useState(defaultStartMonth);
    const [endMonth, setEndMonth] = useState(defaultEndMonth);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['tenantStatement', tenantId, startMonth, endMonth],
        queryFn: () => fetchTenantStatement(tenantId!, startMonth, endMonth), // Fetch data
        enabled: !!tenantId, // Only run query if tenantId exists
    });

    if (!tenantId) return <div className="text-red-500 text-center p-8 dark:text-red-500">Tenant ID not provided.</div>;
    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading tenant statement...</div>;
    if (isError) return <div className="text-red-500 text-center p-8 dark:text-red-500">Failed to load statement: {error?.message || 'Unknown error.'}</div>;

    const statement = data?.data || [];
    const tenantName = data?.tenantName || 'Tenant';

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
            <div className="flex items-center gap-4 mb-6">
                <a href="/dashboard/tenants" className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors duration-150">
                    <ChevronLeft size={24} />
                </a>
                <h1 className="text-3xl font-bold">Monthly Statement for {tenantName}</h1>
            </div>
            
            {/* Date Range Filters (Optional) */}
            <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl border border-border-color dark:border-border-color-dark mb-6 flex flex-col sm:flex-row gap-4 transition-all duration-200">
                <div>
                    <label htmlFor="startMonth" className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">From Month:</label>
                    <input type="month" id="startMonth" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md px-3 py-2 text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                </div>
                <div>
                    <label htmlFor="endMonth" className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-1">To Month:</label>
                    <input type="month" id="endMonth" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md px-3 py-2 text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                </div>
            </div>

            {statement.length === 0 ? (
                <div className="text-center py-16 bg-light-card dark:bg-dark-card rounded-xl border border-dashed border-border-color dark:border-border-color-dark transition-all duration-200">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Statement Data Found</h3>
                    <p className="text-light-text dark:text-light-text-dark mt-2 mb-4">Check the date range or ensure invoices/payments exist for this tenant.</p>
                </div>
            ) : (
                <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-border-color dark:border-border-color-dark overflow-hidden transition-all duration-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg dark:bg-dark-bg/50 border-b border-border-color dark:border-border-color-dark">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Month</th>
                                    <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Expected Due</th>
                                    <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Amount Paid</th>
                                    <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Monthly Balance</th>
                                    <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Cumulative Balance</th>
                                    <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                                {statement.map((entry) => (
                                    <React.Fragment key={entry.month}>
                                        <tr className="hover:bg-light-bg dark:hover:bg-dark-bg/40 transition-colors duration-150">
                                            <td className="p-4 font-bold text-dark-text dark:text-dark-text-dark">{entry.month}</td>
                                            <td className="p-4 text-light-text dark:text-light-text-dark">${entry.expectedDue.toFixed(2)}</td>
                                            <td className="p-4 text-light-text dark:text-light-text-dark">${entry.amountPaid.toFixed(2)}</td>
                                            <td className={`p-4 font-semibold ${entry.monthlyBalance < 0 ? 'text-brand-orange' : 'text-green-600'}`}> {/* Adjusted text-red-600 to brand-orange */}
                                                ${entry.monthlyBalance.toFixed(2)}
                                            </td>
                                            <td className={`p-4 font-bold ${entry.cumulativeBalance < 0 ? 'text-brand-orange' : 'text-green-700'}`}> {/* Adjusted text-red-700 to brand-orange */}
                                                ${entry.cumulativeBalance.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                {/* Optional: Add a button to expand details for invoices/payments */}
                                                <button className="text-brand-primary dark:text-brand-secondary hover:underline text-sm transition-colors">View Details</button>
                                            </td>
                                        </tr>
                                        {/* Optional: Detailed rows for invoices/payments within the month */}
                                        {/* For a true Montrose table, you'd integrate these more directly */}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantStatementPage;
