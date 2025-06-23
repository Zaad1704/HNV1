// frontend/src/components/layout/DashboardLayout.tsx

import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
// FIX: Import necessary icons and hooks
import { 
    Home, Building, Users, CreditCard, Shield, Settings, 
    LogOut, Wrench, FileText, DollarSign, Repeat, Globe, Sun, Moon 
} from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import BottomNavBar from './BottomNavBar';
import RoleGuard from '../RoleGuard';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation(); 
    // FIX: Get language and theme context
    const { lang, setLang, getNextToggleLanguage } = useLang();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => { /* ... no change ... */ };
    const DesktopSidebar = () => { /* ... no change ... */ };

    return (
        <div className="flex h-screen bg-brand-bg">
            <DesktopSidebar />
            
            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-light-card border-b border-border-color flex-shrink-0 flex items-center justify-between px-4 sm:px-8">
                    {/* Empty div to push other items to the right */}
                    <div></div> 
                    <div className="flex items-center gap-4 ml-auto">
                        {/* FIX: Added Language and Theme toggle buttons */}
                        <button
                          onClick={toggleTheme}
                          className="p-2 rounded-full text-light-text hover:bg-gray-100 hover:text-dark-text"
                          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button 
                          onClick={() => setLang(getNextToggleLanguage().code)}
                          className="flex items-center gap-1.5 p-2 rounded-full text-light-text hover:bg-gray-100 hover:text-dark-text"
                          title={`Switch to ${getNextToggleLanguage().name}`}
                        >
                          <Globe size={20} />
                          <span className="font-semibold text-sm">{lang.toUpperCase()}</span>
                        </button>
                        
                        <NotificationsPanel />
                        <div className="h-8 border-l border-border-color"></div>
                        <div className="text-right">
                            <p className="font-semibold text-dark-text">{user?.name}</p>
                            <p className="text-sm text-light-text">{user?.role}</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 md:pb-8">
                    <Outlet />
                </div>
            </main>

            <BottomNavBar />
        </div>
    );
};

export default DashboardLayout;
