// frontend/src/components/layout/BottomNavBar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Home, ShoppingCart, HelpCircle, User } from 'lucide-react';

const BottomNavBar = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const getLinkClass = (path: string) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors rounded-lg';
        const isActive = location.pathname === path;
        return `${base} ${isActive ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`;
    };

    const getActiveClass = (path: string) => {
        return location.pathname === path ? 'primary-card-gradient shadow-md' : '';
    }

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-t border-gray-200 dark:border-border-color-dark z-30">
            <div className="grid grid-cols-4 h-full text-center text-gray-500 p-2 gap-2">
                <Link to="/dashboard/overview" className={`${getLinkClass('/dashboard/overview')} ${getActiveClass('/dashboard/overview')}`}>
                    <Home size={24} />
                    <span className="text-xs font-medium mt-1">Home</span>
                </Link>
                <Link to="/dashboard/tenants" className={`${getLinkClass('/dashboard/tenants')} ${getActiveClass('/dashboard/tenants')}`}>
                    <ShoppingCart size={24} />
                    <span className="text-xs font-medium mt-1">Shop</span>
                </Link>
                <Link to="/dashboard/profile" className={`${getLinkClass('/dashboard/profile')} ${getActiveClass('/dashboard/profile')}`}>
                    <User size={24} />
                    <span className="text-xs font-medium mt-1">Profile</span>
                </Link>
                <Link to="/dashboard/settings" className={`${getLinkClass('/dashboard/settings')} ${getActiveClass('/dashboard/settings')}`}>
                    <HelpCircle size={24} />
                    <span className="text-xs font-medium mt-1">Help</span>
                </Link>
            </div>
        </nav>
    );
};

export default BottomNavBar;
