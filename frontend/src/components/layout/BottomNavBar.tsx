import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, Building, Users, MoreHorizontal, DollarSign, CreditCard, Wrench, FileText, Settings, LogOut } from 'lucide-react';
import MoreMenuModal from '../common/MoreMenuModal';
import RoleGuard from '../RoleGuard';

const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinkClass = (path: string, isButton: boolean = false) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const isActive = !isButton && location.pathname.startsWith(path);
        return `${base} ${isActive ? 'text-brand-primary' : 'text-light-text'}`;
    };

    // Define items for the "More" menu
    const moreNavItems = [
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/maintenance', icon: Wrench, label: 'Maintenance', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/users', icon: Users, label: 'Users & Invites', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/billing', icon: CreditCard, label: 'Billing', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/audit-log', icon: FileText, label: 'Audit Log', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        { action: handleLogout, icon: LogOut, label: 'Logout' }
    ];
    
    // Primary items visible on the bar
    const mainNavItems = [
        { href: '/dashboard/properties', icon: Building, label: 'Properties', roles: ['Landlord', 'Agent'] },
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants', roles: ['Landlord', 'Agent'] }
    ];

    const rightNavItems = [
        { href: '/dashboard/cashflow', icon: DollarSign, label: 'Cash Flow', roles: ['Landlord', 'Agent'] }
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
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
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
                        <Link to="/dashboard/overview" className="absolute -top-4 flex flex-col items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg border-4 border-light-bg">
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
                        <span className="font-medium mt-1">More</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default BottomNavBar;
