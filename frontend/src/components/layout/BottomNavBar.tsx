import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Users, Settings, CreditCard, Wrench } from 'lucide-react'; // FIX: Added CreditCard and Wrench icons

const BottomNavBar = () => {
    const location = useLocation();
    // FIX: Expanded navItems to include more common dashboard sections
    const navItems = [
        { href: '/dashboard/overview', icon: Home, label: 'Home' },
        { href: '/dashboard/properties', icon: Building, label: 'Properties' },
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' }, // FIX: Added Expenses
        { href: '/dashboard/maintenance', icon: Wrench, label: 'Maint.' }, // FIX: Added Maintenance
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link key={item.label} to={item.href} className={`flex flex-col items-center justify-center w-full h-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-light-text'}`}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} /> {/* FIX: Reduced icon size slightly for more items */}
                            <span className="font-medium mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
};

export default BottomNavBar;
