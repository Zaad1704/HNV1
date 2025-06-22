// frontend/src/components/layout/BottomNavBar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building, Users, CreditCard, Wrench, LogOut, MoreHorizontal, DollarSign, Repeat, Shield, FileText, Settings, MessageSquare } from 'lucide-react'; // Added MoreHorizontal, other icons
import { useAuthStore } from '../../store/authStore';
import MoreMenuModal from '../common/MoreMenuModal'; // NEW IMPORT

const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore(); // Get user role
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define all possible navigation items for the dashboard, including role-guarded ones.
    // The 'More' button will contain items not in the primary 4 visible slots.
    const allDashboardNavItems = [
        // Primary visible items (e.g., max 4-5)
        { href: '/dashboard/properties', icon: Building, label: 'Prop.' },
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/overview', icon: Home, label: 'Home', highlight: true }, // Highlighted
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Exp.' },
        { href: '/dashboard/maintenance', icon: Wrench, label: 'Maint.' },
        
        // Items that will go into the "More" menu
        { href: '/dashboard/cashflow', icon: DollarSign, label: 'Cash Flow', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/reminders', icon: Repeat, label: 'Reminders', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/users', icon: Users, label: 'Users & Invites', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/billing', icon: CreditCard, label: 'Billing', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/audit-log', icon: FileText, label: 'Audit Log', roles: ['Landlord', 'Super Admin'] }, // Audit log for Landlord too
        { href: '/admin', icon: Shield, label: 'Admin Panel', roles: ['Super Admin', 'Super Moderator'] }, // Admin link
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        { href: '/dashboard/tenant', icon: MessageSquare, label: 'Portal', roles: ['Tenant'] }, // Tenant Portal
        { action: handleLogout, icon: LogOut, label: 'Logout' },
    ];

    // Filter items to show directly in the bottom bar (e.g., 5 items + More button)
    // Adjust this logic based on how many items you want directly visible besides "Home" and "More"
    const visibleBottomBarItems = [
        allDashboardNavItems.find(item => item.href === '/dashboard/properties'),
        allDashboardNavItems.find(item => item.href === '/dashboard/tenants'),
        allDashboardNavItems.find(item => item.href === '/dashboard/overview'), // Highlighted Home
        allDashboardNavItems.find(item => item.href === '/dashboard/expenses'),
        allDashboardNavItems.find(item => item.href === '/dashboard/maintenance'),
    ].filter(Boolean); // Filter out any undefined if item not found

    // This is the list of items to pass to the MoreMenuModal
    const moreMenuItems = allDashboardNavItems.filter(item => 
        !visibleBottomBarItems.includes(item) && // Not in the main bottom bar
        item.href !== '/dashboard/overview' // Don't include Home again if it's primary.
    );

    const getLinkClass = (itemHref: string, isHighlight?: boolean) => {
        const base = 'flex flex-col items-center justify-center text-xs transition-colors h-full px-1 flex-1';
        const isActive = location.pathname.startsWith(itemHref || '');

        const activeClasses = 'text-brand-primary';
        const inactiveClasses = 'text-light-text';

        if (isHighlight) {
            return `${base} bg-brand-primary text-white font-bold rounded-lg shadow-lg -mt-4 py-2 mx-1 transition-all duration-300 transform scale-110 flex-grow-0 relative overflow-hidden ` +
                   `before:content-[''] before:absolute before:inset-0 before:bg-no-repeat before:bg-center before:bg-contain before:opacity-20 before:z-0 ` +
                   `before:bg-[url('/crowned-badge-bg.png')]`;
        }
        
        return `${base} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-center h-full px-2">
                {visibleBottomBarItems.map(item => {
                    if (item.href) {
                        return (
                            <Link key={item.label} to={item.href} className={getLinkClass(item.href, item.highlight)}>
                                <item.icon size={item.highlight ? 24 : 20} strokeWidth={item.highlight ? 2.5 : 2} />
                                <span className="font-medium mt-1">{item.label}</span>
                            </Link>
                        );
                    }
                    return null; // Should not happen for visibleBottomBarItems
                })}

                {/* The "More" button */}
                <button
                    onClick={() => setIsMoreMenuOpen(true)}
                    className={`flex flex-col items-center justify-center text-xs transition-colors h-full px-1 flex-1 text-light-text`}
                >
                    <MoreHorizontal size={20} />
                    <span className="font-medium mt-1">More</span>
                </button>
            </div>

            {/* More Menu Modal */}
            <MoreMenuModal
                isOpen={isMoreMenuOpen}
                onClose={() => setIsMoreMenuOpen(false)}
                navItems={moreMenuItems}
                userRole={user?.role}
                handleLogout={handleLogout} // Pass the handleLogout function
            />
        </nav>
    );
};

export default BottomNavBar;
