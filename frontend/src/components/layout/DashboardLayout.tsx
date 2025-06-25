// frontend/src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Building, Users, CreditCard, Shield, Settings, LogOut, Wrench, FileText, DollarSign, Repeat, CheckSquare, Bell, Globe, Sun, Moon } from 'lucide-react';
import RoleGuard from '../RoleGuard';
import BottomNavBar from './BottomNavBar';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import { AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { lang, setLang, getNextToggleLanguage } = useLang();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getLinkClass = (path: string) => {
        const base = 'flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200';
        const isActive = location.pathname.startsWith(path);
        // Sidebar link styles remain dark for contrast
        return isActive 
            ? `${base} bg-brand-secondary text-dark-text` 
            : `${base} text-light-text hover:bg-brand-primary/20 hover:text-dark-text`;
    };

    const mainNavLinks = [
        { href: "/dashboard/overview", icon: Home, label: t('dashboard.overview'), roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator'] },
        { href: "/dashboard/tenant", icon: Users, label: 'My Portal', roles: ['Tenant'] },
        { href: "/dashboard/properties", icon: Building, label: t('dashboard.properties'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/tenants", icon: Users, label: t('dashboard.tenants'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/payments", icon: CreditCard, label: 'Payments', roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/expenses", icon: DollarSign, label: t('dashboard.expenses'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/maintenance", icon: Wrench, label: t('dashboard.maintenance'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/cashflow", icon: DollarSign, label: t('dashboard.cash_flow'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/reminders", icon: Repeat, label: t('dashboard.reminders'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/approvals", icon: CheckSquare, label: t('dashboard.approvals'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/users", icon: Users, label: t('dashboard.users_invites'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/billing", icon: CreditCard, label: t('dashboard.billing'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/audit-log", icon: FileText, label: t('dashboard.audit_log'), roles: ['Landlord', 'Agent'] },
    ];
    
    const adminLink = { href: "/admin", icon: Shield, label: t('dashboard.admin_panel'), roles: ['Super Admin', 'Super Moderator'] };

    return (
        <div className="flex h-screen bg-brand-secondary dark:bg-dark-bg text-dark-text dark:text-dark-text-dark">
            <aside className="w-64 flex-shrink-0 bg-brand-dark flex-col hidden md:flex border-r border-border-color-dark">
                <div className="h-20 flex items-center justify-between px-4 border-b border-border-color-dark">
                    <Link to="/dashboard" className="text-xl font-bold text-dark-text flex items-center space-x-3 overflow-hidden">
                       <img src={user?.organizationId?.branding?.companyLogoUrl || "/logo-min.png"} alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain bg-light-card p-1 shadow-sm" />
                       <span className="truncate">{user?.organizationId?.branding?.companyName || 'HNV Dashboard'}</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {mainNavLinks.map(link => (
                         <RoleGuard key={link.href} allowed={link.roles}>
                            <Link to={link.href} className={getLinkClass(link.href)}>
                                <link.icon size={20} /><span>{link.label}</span>
                            </Link>
                         </RoleGuard>
                    ))}
                    <RoleGuard allowed={adminLink.roles}>
                        <hr className="my-4 border-border-color-dark" />
                        <Link to={adminLink.href} className={getLinkClass(adminLink.href)}>
                            <adminLink.icon size={20} /><span>{adminLink.label}</span>
                        </Link>
                    </RoleGuard>
                </nav>
                <div className="p-4 border-t border-border-color-dark">
                    <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}><Settings size={20} /><span>{t('dashboard.settings')}</span></Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-1 font-semibold rounded-lg text-light-text hover:bg-brand-primary/20 hover:text-dark-text transition-all duration-200">
                        <LogOut size={20} /><span>{t('dashboard.logout')}</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-border-color dark:border-border-color-dark flex-shrink-0 flex items-center justify-end px-4 sm:px-8 gap-4 shadow-sm">
                    <button onClick={() => setLang(getNextToggleLanguage().code)} className="p-2 rounded-full text-light-text dark:text-light-text-dark hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
                        <Globe size={20} />
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-light-text dark:text-light-text-dark hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <NotificationsPanel />
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-brand-primary text-dark-text flex items-center justify-center font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:block text-right">
                           <p className="font-semibold text-dark-text dark:text-dark-text-dark">{user?.name}</p>
                           <p className="text-xs text-light-text dark:text-light-text-dark">{user?.role}</p>
                        </div>
                    </div>
                </header>
                
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8">
                    <AnimatePresence mode="wait">
                        <Outlet />
                    </AnimatePresence>
                </div>
            </main>

            <BottomNavBar />
        </div>
    );
};

export default DashboardLayout;
