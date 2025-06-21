import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Users, Settings } from 'lucide-react';

const BottomNavBar = () => {
    const location = useLocation();
    const navItems = [
        { href: '/dashboard/overview', icon: Home, label: 'Home' },
        { href: '/dashboard/properties', icon: Building, label: 'Properties' },
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link key={item.label} to={item.href} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-brand-primary' : 'text-light-text'}`}>
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
};

export default BottomNavBar;
