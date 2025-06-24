import React, { useState } from &#39;react&#39;;
import { useQuery, useMutation, useQueryClient } from &#39;@tanstack/react-query&#39;;
import apiClient from &#39;../api/client&#39;;
import { Link } from &#39;react-router-dom&#39;;
import FinancialChart from &#39;../components/charts/FinancialChart&#39;;
import RentStatusChart from &#39;../components/charts/RentStatusChart&#39;;
import ActionItemWidget from &#39;../components/dashboard/ActionItemWidget&#39;;
import { DollarSign, Building2, Users, FileClock, Wrench, CreditCard, UserCheck } from &#39;lucide-react&#39;;
import { useTranslation } from &#39;react-i18next&#39;;
import { useLang } from &#39;../contexts/LanguageContext&#39;;
import { useWindowSize } from &#39;../hooks/useWindowSize&#39;;
import { useAuthStore } from &#39;../store/authStore&#39;; // Import auth store

// --- API Fetching Functions ---
const fetchOverviewStats = async () =\> { /\* ... */ };
const fetchLateTenants = async () =\> { /* ... */ };
const fetchFinancialSummary = async () =\> { /* ... */ };
const fetchRentStatus = async () =\> { /* ... */ };
const fetchRecentActivity = async () =\> { /* ... */ };
const sendRentReminder = async (tenantId: string) =\> { /* ... \*/ };

const StatCard = ({ title, value, icon, currency = '', to }: { title: string, value: number | string, icon: React.ReactNode, currency?: string, to: string }) =\> ( /\* ... */ );
const DashboardNavCard = ({ to, icon, title, description }: { to: string, icon: React.ReactNode, title: string, description: string }) =\> ( /* ... \*/ );

const OverviewPage = () =\> {
const { t } = useTranslation();
const { currencyName } = useLang();
const { width } = useWindowSize();
const { isAuthenticated } = useAuthStore(); // Get authentication status
const queryClient = useQueryClient();

// --- Data Queries are now conditional on authentication ---
const { data: stats, isLoading: isLoadingStats } = useQuery({
queryKey: ['overviewStats'],
queryFn: fetchOverviewStats,
enabled: isAuthenticated // This query will only run if the user is authenticated
});
const { data: lateTenants } = useQuery({
queryKey: ['lateTenants'],
queryFn: fetchLateTenants,
enabled: isAuthenticated
});
const { data: financialData } = useQuery({
queryKey: ['financialSummary'],
queryFn: fetchFinancialSummary,
enabled: isAuthenticated
});
const { data: rentStatusData } = useQuery({
queryKey: ['rentStatus'],
queryFn: fetchRentStatus,
enabled: isAuthenticated
});
const { data: recentActivity } = useQuery({
queryKey: ['recentActivity'],
queryFn: fetchRecentActivity,
enabled: isAuthenticated
});

// ... rest of the component logic (mutations, handlers) remains the same ...

if (isLoadingStats) {
return <div className="text-dark-text text-center p-8">Loading Dashboard Data...</div>;
}

// --- RENDER MOBILE VIEW ---
if (width &lt; 768) {
return (
<div className="space-y-6">
{/* ... Mobile view JSX ... */}
</div>
)
}

// --- RENDER DESKTOP VIEW ---
return (
<div className="space-y-8">
{/* ... Desktop view JSX ... */}
</div>
);


};

export default OverviewPage;
