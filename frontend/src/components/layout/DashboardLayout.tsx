import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { 
    Home, Building, Users, CreditCard, Shield, Settings, 
    LogOut, Wrench, FileText, DollarSign, Repeat, Globe, Sun, Moon 
} from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import BottomNavBar from './BottomNavBar';
import RoleGuard from '../RoleGuard';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { lang, setLang, getNextToggleLanguage } = useLang();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const DesktopSidebar = () => {
        const getLinkClass = (path: string) => {
            const base = 'flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors';
            const isActive = location.pathname.startsWith(path);
            return isActive ? `${base} bg-brand-primary/20 text-white` : `${base} text-indigo-200 hover:bg-brand-primary/10 hover:text-white`;
        };

        return (
            <aside className="w-64 flex-shrink-0 bg-brand-dark flex-col hidden md:flex">
                <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
                    <Link to="/dashboard" className="text-xl font-bold text-white flex items-center space-x-3 overflow-hidden">
                       <img src="/logo-min.png" alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain" />
                       <span className="truncate">{user?.organizationId?.branding?.companyName || 'HNV Dashboard'}</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <Link to="/dashboard/overview" className={getLinkClass('/dashboard/overview')}><Home size={20} /><span>{t('dashboard.overview')}</span></Link>
                    
                    <RoleGuard allowed={['Tenant']}>
                        <Link to="/dashboard/tenant" className={getLinkClass('/dashboard/tenant')}><Users size={20} /><span>{t('dashboard.my_tenant_portal')}</span></Link>
                    </RoleGuard>

                    {/*
                      FIX: Added 'Super Admin' and 'Super Moderator' to this RoleGuard.
                      This now correctly shows all core management links to admins, landlords, and agents.
                    */}
                    <RoleGuard allowed={['Super Admin', 'Super Moderator', 'Landlord', 'Agent']}>
                        <Link to="/dashboard/properties" className={getLinkClass('/dashboard/properties')}><Building size={20} /><span>{t('dashboard.properties')}</span></Link>
                        <Link to="/dashboard/tenants" className={getLinkClass('/dashboard/tenants')}><Users size={20} /><span>{t('dashboard.tenants')}</span></Link>
                        <Link to="/dashboard/expenses" className={getLinkClass('/dashboard/expenses')}><CreditCard size={20} /><span>{t('dashboard.expenses')}</span></Link>
                        <Link to="/dashboard/maintenance" className={getLinkClass('/dashboard/maintenance')}><Wrench size={20} /><span>{t('dashboard.maintenance')}</span></Link>
                        <Link to="/dashboard/cashflow" className={getLinkClass('/dashboard/cashflow')}><DollarSign size={20} /><span>{t('dashboard.cash_flow')}</span></Link>
                        <Link to="/dashboard/reminders" className={getLinkClass('/dashboard/reminders')}><Repeat size={20} /><span>{t('dashboard.reminders')}</span></Link>
                        <Link to="/dashboard/users" className={getLinkClass('/dashboard/users')}><Users size={20} /><span>{t('dashboard.users_invites')}</span></Link>
                        <Link to="/dashboard/billing" className={getLinkClass('/dashboard/billing')}><CreditCard size={20} /><span>{t('dashboard.billing')}</span></Link>
                        <Link to="/dashboard/audit-log" className={getLinkClass('/dashboard/audit-log')}><FileText size={20} /><span>{t('dashboard.audit_log')}</span></Link>
                    </RoleGuard>

                    <RoleGuard allowed={['Super Admin', 'Super Moderator']}>
                        <hr className="my-4 border-white/10" />
                        <Link to="/admin" className={getLinkClass('/admin')}><Shield size={20} /><span>{t('dashboard.admin_panel')}</span></Link>
                    </RoleGuard>
                </nav>
                <div className="p-4 border-t border-white/10">
                    <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}><Settings size={20} /><span>{t('dashboard.settings')}</span></Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-1 font-semibold rounded-lg text-indigo-200 hover:bg-red-800/20 hover:text-white">
                        <LogOut size={20} /><span>{t('dashboard.logout')}</span>
                    </button>
                </div>
            </aside>
        );
    };

    return (
        <div className="flex h-screen bg-brand-bg">
            <DesktopSidebar />
            
            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-light-card border-b border-border-color flex-shrink-0 flex items-center justify-between px-4 sm:px-8">
                    <div></div> 
                    <div className="flex items-center gap-4 ml-auto">
                        <button
                          onClick={toggleTheme}
                          className="p-2 rounded-full text-light-text hover:bg-gray-100 hover:text-dark-text"
                          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button 
                          onClick={() => setLang(getNextToggleLanguage().code)}
                          className="flex items-center gap-1.5 p-2 rounded-full text-light-text hover:bg-gray-100 hover:text-dark-text"
                          title={`Switch to ${getNextToggleLanguage().name}`}
                        >
                          <Globe size={20} />
                          <span className="font-semibold text-sm">{lang.toUpperCase()}</span>
                        </button>
                        
                        <NotificationsPanel />
                        <div className="h-8 border-l border-border-color"></div>
                        <div className="text-right">
                            <p className="font-semibold text-dark-text">{user?.name}</p>
                            <p className="text-sm text-light-text">{user?.role}</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 md:pb-8">
                    <Outlet />
                </div>
            </main>

            <BottomNavBar />
        </div>
    );
};

export default DashboardLayout;
