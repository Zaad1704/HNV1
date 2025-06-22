// frontend/src/components/layout/BottomNavBar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building, Users, Settings, CreditCard, Wrench, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Redefine navItems to prioritize Home (Overview) in the middle
    const navItems = [
        { href: '/dashboard/properties', icon: Building, label: 'Prop.' }, // Abbreviated for space
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/overview', icon: Home, label: 'Home', highlight: true }, // Highlighted item
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Exp.' }, // Abbreviated for space
        { href: '/dashboard/maintenance', icon: Wrench, label: 'Maint.' },
        // Consider removing settings/logout if too many items for a small screen, or group them.
        // For now, keeping them to fit your request.
        // { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        // { action: handleLogout, icon: LogOut, label: 'Logout' }
    ];

    const getLinkClass = (itemHref: string, isHighlight?: boolean) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const isActive = location.pathname.startsWith(itemHref || '');

        const activeClasses = 'text-brand-primary';
        const inactiveClasses = 'text-light-text';

        // Apply highlight specific classes
        if (isHighlight) {
            return `${base} bg-brand-primary text-white font-bold rounded-lg shadow-lg -mt-4 py-2 mx-1 transition-all duration-300 transform scale-110 flex-grow-0`; // Example highlight styles
        }
        
        return `${base} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-center h-full px-2"> {/* Added px-2 for padding */}
                {navItems.map(item => {
                    if (item.href) {
                        return (
                            <Link key={item.label} to={item.href} className={getLinkClass(item.href, item.highlight)}>
                                <item.icon size={item.highlight ? 24 : 20} strokeWidth={item.highlight ? 2.5 : 2} />
                                <span className="font-medium mt-1">{item.label}</span>
                            </Link>
                        );
                    } else if (item.action) {
                        return (
                            <button key={item.label} onClick={item.action} className="flex flex-col items-center justify-center w-full h-full text-xs transition-colors text-light-text hover:text-red-500">
                                <item.icon size={20} strokeWidth={2} />
                                <span className="font-medium mt-1">{item.label}</span>
                            </button>
                        );
                    }
                    return null;
                })}
            </div>
        </nav>
    );
};

export default BottomNavBar;
