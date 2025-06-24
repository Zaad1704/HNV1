import React, { useState } from &#39;react&#39;;
import { useQuery, useMutation, useQueryClient } from &#39;@tanstack/react-query&#39;;
import apiClient from &#39;../api/client&#39;;
import { Link } from &#39;react-router-dom&#39;;
import FinancialChart from &#39;../components/charts/FinancialChart&#39;;
import RentStatusChart from &#39;../components/charts/RentStatusChart&#39;;
import ActionItemWidget from &#39;../components/dashboard/ActionItemWidget&#39;;
import { DollarSign, Building2, Users, FileClock, Wrench, CreditCard, UserCheck, Repeat } from &#39;lucide-react&#39;;
import { useTranslation } from &#39;react-i18next&#39;;
import { useLang } from &#39;../contexts/LanguageContext&#39;;
import { useWindowSize } from &#39;../hooks/useWindowSize&#39;; // Import hook to detect screen size

// --- API Fetching Functions (No Changes Here) ---
const fetchOverviewStats = async () =\> {
const { data } = await apiClient.get('/dashboard/overview-stats');
return data.data;
};
const fetchLateTenants = async () =\> {
const { data } = await apiClient.get('/dashboard/late-tenants');
return data.data;
};
const fetchFinancialSummary = async () =\> {
const { data } = await apiClient.get('/dashboard/financial-summary');
return data.data;
};
const fetchRentStatus = async () =\> {
const { data } = await apiClient.get('/dashboard/rent-status');
return data.data;
};
const fetchRecentActivity = async () =\> {
const { data } = await apiClient.get('/dashboard/recent-activity');
return data.data;
};
const sendRentReminder = async (tenantId: string) =\> {
const { data } = await apiClient.post('/communication/send-rent-reminder', { tenantId });
return data.message;
};

// --- Reusable Components (No Changes Here) ---
const StatCard = ({ title, value, icon, currency = '', to }: { title: string, value: number | string, icon: React.ReactNode, currency?: string, to: string }) =\> (
&lt;Link to={to} className=&quot;bg-light-card p-6 rounded-xl border border-border-color shadow-sm flex items-center justify-between hover:border-brand-primary transition-colors&quot;&gt;
&lt;div&gt;
&lt;p className=&quot;text-sm font-medium text-light-text&quot;&gt;{title}&lt;/p&gt;
&lt;p className=&quot;text-3xl font-bold text-dark-text mt-2&quot;&gt;
{currency}{typeof value === 'number' ? value.toLocaleString() : value}
&lt;/p&gt;
&lt;/div&gt;
&lt;div className=&quot;bg-brand-primary/10 text-brand-primary p-3 rounded-lg&quot;&gt;
{icon}
&lt;/div&gt;
&lt;/Link&gt;
);

// --- NEW: Card Component for Mobile Dashboard Navigation ---
const DashboardNavCard = ({ to, icon, title, description }: { to: string, icon: React.ReactNode, title: string, description: string }) =\> (
&lt;Link to={to} className=&quot;bg-light-card p-4 rounded-xl border border-border-color shadow-sm flex items-center gap-4 hover:border-brand-primary transition-colors&quot;&gt;
&lt;div className=&quot;bg-brand-primary/10 text-brand-primary p-3 rounded-lg&quot;&gt;
{icon}
&lt;/div&gt;
&lt;div&gt;
&lt;h3 className=&quot;font-bold text-dark-text&quot;&gt;{title}&lt;/h3&gt;
&lt;p className=&quot;text-xs text-light-text&quot;&gt;{description}&lt;/p&gt;
&lt;/div&gt;
&lt;/Link&gt;
);

const OverviewPage = () =\> {
const { t } = useTranslation();
const { currencyName } = useLang();
const [sendingReminderId, setSendingReminderId] = useState\<string | null\>(null);
const { width } = useWindowSize(); // Get screen width

// --- Data Queries and Mutations (No Changes Here) ---
const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['overviewStats'], queryFn: fetchOverviewStats });
const { data: lateTenants } = useQuery({ queryKey: ['lateTenants'], queryFn: fetchLateTenants });
const { data: financialData } = useQuery({ queryKey: ['financialSummary'], queryFn: fetchFinancialSummary });
const { data: rentStatusData } = useQuery({ queryKey: ['rentStatus'], queryFn: fetchRentStatus });
const { data: recentActivity } = useQuery({ queryKey: ['recentActivity'], queryFn: fetchRecentActivity });
const reminderMutation = useMutation({ mutationFn: sendRentReminder, /* ... / });
const handleSendReminder = (tenantId: string) => { / ... */ };

const isLoading = isLoadingStats; // Simplified loading check
if (isLoading) {
return <div className="text-dark-text text-center p-8">Loading Dashboard Data...</div>;
}

// --- RENDER MOBILE VIEW ---
if (width &lt; 768) {
return (
<div className="space-y-6">
<h1 className="text-3xl font-bold text-dark-text">{t('dashboard.overview')}</h1>
<div className="grid grid-cols-2 gap-4">
&lt;StatCard title={t('dashboard.monthly_revenue')} value={stats?.monthlyRevenue || 0} currency={currencyName} icon={<DollarSign className="w-5 h-5"/>} to="/dashboard/payments" />
&lt;StatCard title={t('dashboard.overdue_rent')} value={stats?.overdueRent || 0} currency={currencyName} icon={<UserCheck className="w-5 h-5"/>} to="/dashboard/tenants" />
</div>

        <h2 className="text-xl font-bold text-dark-text pt-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4">
            <DashboardNavCard to="/dashboard/properties" icon={<Building2 size={22}/>} title="Properties" description="Manage all properties" />
            <DashboardNavCard to="/dashboard/tenants" icon={<Users size={22}/>} title="Tenants" description="View & manage tenants" />
            <DashboardNavCard to="/dashboard/expenses" icon={<CreditCard size={22}/>} title="Expenses" description="Log & track expenses" />
            <DashboardNavCard to="/dashboard/maintenance" icon={<Wrench size={22}/>} title="Maintenance" description="View open requests" />
        </div>
    </div>
)
}

// --- RENDER DESKTOP VIEW ---
return (
<div className="space-y-8">
<h1 className="text-4xl font-bold text-dark-text">{t('dashboard.overview')}</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title={t('dashboard.monthly_revenue')} value={stats?.monthlyRevenue || 0} currency={currencyName} icon={<DollarSign className="w-6 h-6"/>} to="/dashboard/payments" />
        <StatCard title={t('dashboard.total_properties')} value={stats?.totalProperties || 0} icon={<Building2 className="w-6 h-6"/>} to="/dashboard/properties" />
        <StatCard title={t('dashboard.active_tenants')} value={stats?.activeTenants || 0} icon={<Users className="w-6 h-6"/>} to="/dashboard/tenants" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold text-dark-text mb-4">{t('dashboard.financials_chart_title')}</h2>
            <FinancialChart data={financialData || []} />
        </div>
        <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold text-dark-text mb-4">{t('dashboard.rent_status_chart_title')}</h2>
            <RentStatusChart data={rentStatusData || []} />
        </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <ActionItemWidget
            title={t('dashboard.overdue_rent_reminders')}
            items={lateTenants?.map((t: any) => ({ id: t._id, primaryText: t.name, secondaryText: `Property: ${t.propertyId?.name || 'N/A'}` }))}
            actionText={t('dashboard.send_reminder')}
            linkTo="/dashboard/tenants"
            onActionClick={handleSendReminder}
            isActionLoading={reminderMutation.isLoading}
            loadingItemId={sendingReminderId}
            emptyText={t('dashboard.no_tenants_overdue')}
        />
        <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
            <h2 className="text-xl font-bold text-dark-text mb-4">Recent Activity</h2>
            <ul className="space-y-4">
                {(recentActivity || []).map((activity: any) => (
                    <li key={activity._id} className="flex items-center gap-4">
                        <div className="p-2 bg-light-bg rounded-full border border-border-color">
                            <FileClock size={20} className="text-light-text" />
                        </div>
                        <div>
                            <p className="font-semibold text-dark-text">{activity.action.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-light-text">
                                by {activity.user?.name || 'System'} - {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
</div>
);


};

export default OverviewPage;
