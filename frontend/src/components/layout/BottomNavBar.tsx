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

    const navItems = [
        { href: '/dashboard/properties', icon: Building, label: 'Props' },
        { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
        { href: '/dashboard/overview', icon: Home, label: 'Home', isCrown: true },
        { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        { action: handleLogout, icon: LogOut, label: 'Logout' }
    ];

    const getLinkClass = (itemHref: string, isCrown?: boolean) => {
        let isActive = false; // --- CHANGE: 'const' to 'let' ---
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        isActive = location.pathname.startsWith(itemHref); // Reassignment

        const activeColor = isActive ? 'text-brand-primary' : 'text-light-text';

        const crownStyle = isCrown ?
            'flex-grow-0 w-24 h-24 -mt-10 mx-2 text-white shadow-xl relative z-20 flex-shrink-0 ' +
            'bg-brand-primary border-4 border-light-card ' +
            'bg-contain bg-no-repeat bg-center ' +
            'transform hover:scale-105 transition-transform duration-200 ease-in-out' :
            'flex-grow';
        
        const crownActiveColor = isCrown && isActive ? 'text-white' : (isCrown ? 'text-white' : activeColor);

        return `${base} ${activeColor} ${crownStyle} ${crownActiveColor} dark:text-light-text-dark dark:border-border-color-dark dark:bg-dark-card ${isCrown ? 'dark:bg-brand-primary dark:border-dark-bg' : ''}`;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30 dark:bg-dark-card dark:border-border-color-dark">
            <div className="flex justify-around items-end h-full">
                {navItems.map(item => {
                    if (item.href) {
                        return (
                            <Link 
                                key={item.label} 
                                to={item.href} 
                                className={getLinkClass(item.href, item.isCrown)}
                                style={item.isCrown ? { backgroundImage: `url('/crowned-badge-bg.png')` } : {}}
                            >
                                <div className={`flex flex-col items-center justify-center ${item.isCrown ? 'w-full h-full' : 'p-1'}`}>
                                    <item.icon size={item.isCrown ? 32 : 20} strokeWidth={item.isCrown ? 2.5 : 2} />
                                    <span className={`font-medium mt-1 ${item.isCrown ? 'text-white text-xs' : ''}`}>{item.label}</span>
                                </div>
                            </Link>
                        );
                    } else if (item.action) {
                        return (
                            <button key={item.label} onClick={item.action} className="flex flex-col items-center justify-center w-full h-full text-xs transition-colors text-light-text hover:text-red-500 dark:text-light-text-dark dark:hover:text-red-400">
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
