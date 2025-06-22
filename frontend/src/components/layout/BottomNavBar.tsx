import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building, Users, CreditCard, Wrench, LogOut, MoreHorizontal, DollarSign, Repeat, Shield, FileText, Settings, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import MoreMenuModal from '../common/MoreMenuModal'; // Assuming correct path and file existence

const BottomNavBar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define all possible navigation items for the dashboard, including role-guarded ones.
    const allDashboardNavItems = [
        { href: '/dashboard/overview', icon: Home, label: 'Home', isHighlight: true }, // Highlighted Home
        { href: '/dashboard/properties', icon: Building, label: 'Prop.' }, // Abbreviated
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Exp.' }, // Abbreviated
        { href: '/dashboard/maintenance', icon: Wrench, label: 'Maint.' }, // Abbreviated
        
        // Items that will go into the "More" menu
        { href: '/dashboard/cashflow', icon: DollarSign, label: 'Cash Flow', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/reminders', icon: Repeat, label: 'Reminders', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/users', icon: Users, label: 'Users & Invites', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/billing', icon: CreditCard, label: 'Billing', roles: ['Agent', 'Landlord'] },
        { href: '/dashboard/audit-log', icon: FileText, label: 'Audit Log', roles: ['Landlord', 'Super Admin'] },
        { href: '/admin', icon: Shield, label: 'Admin Panel', roles: ['Super Admin', 'Super Moderator'] },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        { href: '/dashboard/tenant', icon: MessageSquare, label: 'Portal', roles: ['Tenant'] }, // Tenant Portal
        { action: handleLogout, icon: LogOut, label: 'Logout' },
    ];

    // Filter items to show directly in the bottom bar (e.g., 4 regular items + Home + More button = 6 slots)
    // Adjust order based on desired prominence.
    const visibleBottomBarItems = [
        allDashboardNavItems.find(item => item.href === '/dashboard/properties'),
        allDashboardNavItems.find(item => item.href === '/dashboard/tenants'),
        allDashboardNavItems.find(item => item.href === '/dashboard/overview'), // Highlighted Home
        allDashboardNavItems.find(item => item.href === '/dashboard/expenses'),
        allDashboardNavItems.find(item => item.href === '/dashboard/maintenance'),
    ].filter(Boolean); // Filter out any undefined if item not found

    // This is the list of items to pass to the MoreMenuModal
    const moreMenuItems = allDashboardNavItems.filter(item => 
        !visibleBottomBarItems.some(visibleItem => visibleItem?.href === item.href) // Exclude items already in visible bar
    );

    const getLinkClass = (itemHref: string, isHighlight?: boolean) => {
        const base = 'flex flex-col items-center justify-center text-xs transition-colors h-full px-1 flex-1 relative z-10'; // Added relative z-10
        const isActive = location.pathname.startsWith(itemHref || '');

        // Styling for the highlighted item (Home)
        if (isHighlight) {
            return `
                ${base}
                bg-brand-primary text-white font-bold rounded-lg shadow-lg
                -mt-4 py-2 mx-1
                transition-all duration-300 transform scale-110
                flex-grow-0
                relative overflow-hidden
                before:content-[''] before:absolute before:inset-0
                before:bg-[url('/crowned-badge-bg.png')] before:bg-no-repeat before:bg-center before:bg-contain
                before:opacity-20 before:z-0
            `;
        }
        // Styling for non-highlighted items
        return `${base} ${isActive ? 'text-brand-primary font-semibold' : 'text-light-text hover:text-dark-text'}`;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-start h-full px-2"> {/* items-start to push text down from highlighted item */}
                {visibleBottomBarItems.map(item => {
                    if (item && item.href) { // Ensure item exists and has href for Link
                        return (
                            <Link key={item.label} to={item.href} className={getLinkClass(item.href, item.isHighlight)}>
                                <item.icon size={item.isHighlight ? 24 : 20} className={item.isHighlight ? "text-white" : ""} />
                                <span className="font-medium mt-1 text-inherit">{item.label}</span>
                            </Link>
                        );
                    }
                    return null;
                })}

                {/* The "More" button always visible */}
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
                handleLogout={handleLogout}
            />
        </nav>
    );
};

export default BottomNavBar;
