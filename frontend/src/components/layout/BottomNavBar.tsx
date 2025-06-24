// frontend/src/components/layout/BottomNavBar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import {
    Home, Building, Users, MoreHorizontal, DollarSign,
    CreditCard, Wrench, FileText, Settings, LogOut, Repeat, CheckSquare
} from 'lucide-react';
import MoreMenuModal from '../common/MoreMenuModal';
import RoleGuard from '../RoleGuard';

const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { t } = useTranslation();
    const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinkClass = (path: string, isButton: boolean = false) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const isActive = !isButton && location.pathname.startsWith(path);
        // Adjusted colors for bottom nav links
        return `${base} ${isActive ? 'text-brand-primary' : 'text-light-text'}`;
    };

    // ADDED "Approvals" to this list to match the desktop sidebar
    const moreNavItems = [
        { href: '/dashboard/expenses', icon: CreditCard, label: t('dashboard.expenses'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/maintenance', icon: Wrench, label: t('dashboard.maintenance'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/reminders', icon: Repeat, label: t('dashboard.reminders'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/approvals', icon: CheckSquare, label: 'Approvals', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/users', icon: Users, label: t('dashboard.users_invites'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/billing', icon: CreditCard, label: t('dashboard.billing'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/audit-log', icon: FileText, label: t('dashboard.audit_log'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/settings', icon: Settings, label: t('dashboard.settings') },
        { action: handleLogout, icon: LogOut, label: t('dashboard.logout') }
    ];
    
    const mainNavItems = [
        { href: '/dashboard/properties', icon: Building, label: t('dashboard.properties'), roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/tenants', icon: Users, label: t('dashboard.tenants'), roles: ['Landlord', 'Agent'] }
    ];

    const rightNavItems = [
        { href: '/dashboard/cashflow', icon: DollarSign, label: t('dashboard.cash_flow'), roles: ['Landlord', 'Agent'] }
    ];

    return (
        <>
            <MoreMenuModal
                isOpen={isMoreMenuOpen}
                onClose={() => setMoreMenuOpen(false)}
                navItems={moreNavItems}
                userRole={user?.role}
                handleLogout={handleLogout}
            />
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30"> {/* bg-light-card is now dark */}
                <div className="grid grid-cols-5 h-full">
                    {/* Left Items */}
                    <RoleGuard allowed={['Landlord', 'Agent']}>
                        {mainNavItems.map(item => (
                             <Link key={item.label} to={item.href} className={getLinkClass(item.href)}>
                                <item.icon size={20} strokeWidth={location.pathname.startsWith(item.href) ? 2.5 : 2} />
                                <span className="font-medium mt-1">{item.label}</span>
                            </Link>
                        ))}
                    </RoleGuard>

                    {/* Centered Home Button */}
                    <div className="relative flex justify-center">
                        <Link to="/dashboard/overview" className="absolute -top-4 flex flex-col items-center justify-center w-16 h-16 bg-brand-primary text-dark-text rounded-full shadow-lg border-4 border-light-bg"> {/* bg-brand-primary is new, text-dark-text is light, border-light-bg is new dark */}
                            <Home size={24} />
                        </Link>
                    </div>

                    {/* Right Items */}
                    <RoleGuard allowed={['Landlord', 'Agent']}>
                         {rightNavItems.map(item => (
                             <Link key={item.label} to={item.href} className={getLinkClass(item.href)}>
                                <item.icon size={20} strokeWidth={location.pathname.startsWith(item.href) ? 2.5 : 2} />
                                <span className="font-medium mt-1">{item.label}</span>
                            </Link>
                        ))}
                    </RoleGuard>

                    {/* More Button */}
                    <button onClick={() => setMoreMenuOpen(true)} className={getLinkClass('', true)}>
                        <MoreHorizontal size={20} />
                        <span className="font-medium mt-1">{t('dashboard.more')}</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default BottomNavBar;
