// frontend/src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Building, Users, CreditCard, Shield, Settings, LogOut, Wrench, FileText, DollarSign, Repeat, CheckSquare, Bell, Globe, Sun, Moon } from 'lucide-react';
import RoleGuard from '../RoleGuard';
import BottomNavBar from './BottomNavBar';
import NotificationsPanel from '../dashboard/NotificationsPanel';

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
        const base = 'flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors';
        const isActive = location.pathname.startsWith(path);
        // Adjusted colors for dashboard sidebar links
        return isActive ? `${base} bg-brand-primary text-dark-text` : `${base} text-light-text hover:bg-brand-secondary hover:text-dark-text`;
    };

    // Main navigation links for the sidebar
    const mainNavLinks = [
        { href: "/dashboard/overview", icon: Home, label: t('dashboard.overview'), roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator'] },
        { href: "/dashboard/tenant", icon: Users, label: 'My Portal', roles: ['Tenant'] },
        { href: "/dashboard/properties", icon: Building, label: t('dashboard.properties'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/tenants", icon: Users, label: t('dashboard.tenants'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/expenses", icon: CreditCard, label: t('dashboard.expenses'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/maintenance", icon: Wrench, label: t('dashboard.maintenance'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/cashflow", icon: DollarSign, label: t('dashboard.cash_flow'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/reminders", icon: Repeat, label: t('dashboard.reminders'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/approvals", icon: CheckSquare, label: t('dashboard.approvals'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/users", icon: Users, label: t('dashboard.users_invites'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/billing", icon: CreditCard, label: t('dashboard.billing'), roles: ['Landlord', 'Agent'] },
        { href: "/dashboard/audit-log", icon: FileText, label: t('dashboard.audit_log'), roles: ['Landlord', 'Agent'] },
    ];
    
    // Admin link, separated for clarity
    const adminLink = { href: "/admin", icon: Shield, label: t('dashboard.admin_panel'), roles: ['Super Admin', 'Super Moderator'] };

    return (
        <div className="flex h-screen bg-light-bg text-dark-text"> {/* bg-brand-bg --> bg-light-bg */}
            {/* Desktop Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-brand-dark flex-col hidden md:flex"> {/* bg-brand-dark is new dark color */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-border-color"> {/* border-white/10 --> border-border-color */}
                    <Link to="/dashboard" className="text-xl font-bold text-dark-text flex items-center space-x-3 overflow-hidden"> {/* text-white --> text-dark-text */}
                       <img src={user?.organizationId?.branding?.companyLogoUrl || "/logo-min.png"} alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain bg-light-card p-1" /> {/* bg-white --> bg-light-card */}
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
                        <hr className="my-4 border-border-color" /> {/* border-white/10 --> border-border-color */}
                        <Link to={adminLink.href} className={getLinkClass(adminLink.href)}>
                            <adminLink.icon size={20} /><span>{adminLink.label}</span>
                        </Link>
                    </RoleGuard>
                </nav>
                <div className="p-4 border-t border-border-color"> {/* border-white/10 --> border-border-color */}
                    <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}><Settings size={20} /><span>{t('dashboard.settings')}</span></Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-1 font-semibold rounded-lg text-light-text hover:bg-brand-secondary hover:text-dark-text"> {/* text-indigo-200 --> text-light-text, hover adjusted */}
                        <LogOut size={20} /><span>{t('dashboard.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {/* --- HEADER --- */}
                <header className="h-20 bg-light-card/80 backdrop-blur-md border-b border-border-color flex-shrink-0 flex items-center justify-end px-4 sm:px-8 gap-4">
                    {/* Language and Theme Toggles */}
                    <button onClick={() => setLang(getNextToggleLanguage().code)} className="p-2 rounded-full hover:bg-brand-accent-light"> {/* hover:bg-gray-100 --> hover:bg-brand-accent-light */}
                        <Globe size={20} className="text-light-text" /> {/* text-light-text now light */}
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-brand-accent-light"> {/* hover:bg-gray-100 --> hover:bg-brand-accent-light */}
                        {theme === 'light' ? <Moon size={20} className="text-light-text" /> : <Sun size={20} className="text-light-text" />} {/* text-light-text now light */}
                    </button>
                    
                    {/* Notifications */}
                    <NotificationsPanel />

                    {/* User Profile Dropdown Placeholder */}
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-brand-primary text-dark-text flex items-center justify-center font-bold"> {/* text-white --> text-dark-text */}
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:block text-right">
                           <p className="font-semibold text-dark-text">{user?.name}</p>
                           <p className="text-xs text-light-text">{user?.role}</p>
                        </div>
                    </div>
                </header>
                
                {/* Scrollable Content */}
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNavBar />
        </div>
    );
};

export default DashboardLayout;
