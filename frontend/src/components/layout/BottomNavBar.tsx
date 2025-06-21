import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Home, Building, Users, Settings, CreditCard, Wrench, LogOut } from 'lucide-react'; // FIX: Added LogOut icon
import { useAuthStore } from '../../store/authStore'; // Import useAuthStore

const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore(); // Get logout function

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { href: '/dashboard/overview', icon: Home, label: 'Home' },
        { href: '/dashboard/properties', icon: Building, label: 'Properties' },
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
        { href: '/dashboard/maintenance', icon: Wrench, label: 'Maint.' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        // Add Logout item
        { action: handleLogout, icon: LogOut, label: 'Logout' } // Use 'action' for logout button
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => {
                    const isActive = location.pathname.startsWith(item.href || ''); // Handle action items not having href
                    
                    // Render Link for navigation items, button for action items
                    if (item.href) {
                        return (
                            <Link key={item.label} to={item.href} className={`flex flex-col items-center justify-center w-full h-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-light-text'}`}>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
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
                    return null; // Should not happen
                })}
            </div>
        </nav>
    );
};

export default BottomNavBar;
