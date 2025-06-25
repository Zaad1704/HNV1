import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Tag, Phone, LogIn, MoreHorizontal, Globe, Sun, Moon } from 'lucide-react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LanguageContext';

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
    
    const { theme, toggleTheme } = useTheme();
    const { setLang, getNextToggleLanguage } = useLang();

    // Sections on the landing page that this bottom nav will link to
    const navItems = [
        { name: t('header.about', 'About'), href: '/#about', icon: Home, sectionId: 'about' },
        { name: t('header.services', 'Services'), href: '/#services', icon: Compass, sectionId: 'services' },
        { name: t('header.pricing', 'Pricing'), href: '/#pricing', icon: Tag, sectionId: 'pricing' },
        { name: t('header.contact', 'Contact'), href: '/#contact', icon: Phone, sectionId: 'contact' },
    ];
    
    // For the 4 main visible icons + 1 "More" icon
    const visibleNavItems = navItems.slice(0, 3); // Take first 3 for direct display
    const moreMenuItems = navItems.slice(3); // The rest go into 'More'

    const sectionIds = navItems.map(item => item.sectionId).filter(Boolean) as string[];
    const activeSectionId = useScrollSpy(sectionIds, 150); // Using useScrollSpy to highlight active section

    const getLinkClass = (itemHref: string, itemSectionId?: string) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors rounded-lg';
        // Determine if the link is active based on current path or scroll spy for landing page
        const isActive = (location.pathname === '/' && itemSectionId && activeSectionId === itemSectionId) || (location.pathname === itemHref);
        
        return `${base} ${isActive ? 'text-brand-primary dark:text-brand-secondary' : 'text-light-text dark:text-light-text-dark group-hover:text-brand-primary dark:group-hover:text-brand-secondary'}`;
    };

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        setMoreMenuOpen(false);
        if (href.startsWith('/#')) {
            e.preventDefault();
            const targetId = href.substring(2);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // For direct page links like /login
            // The Link component handles navigation, so no need for manual navigate()
        }
    };

    const handleLanguageToggle = () => {
        setLang(getNextToggleLanguage().code);
        setMoreMenuOpen(false);
    };

    const handleThemeToggle = () => {
        toggleTheme();
        setMoreMenuOpen(false);
    };

    return (
        // Only show on screens smaller than 'md' breakpoint
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card dark:bg-dark-card border-t border-border-color dark:border-border-color-dark shadow-t-lg z-30 transition-colors duration-300">
            {isMoreMenuOpen && (
                <div className="absolute bottom-16 right-4 w-48 bg-light-card dark:bg-dark-card rounded-lg shadow-xl border border-border-color dark:border-border-color-dark p-2 text-sm text-dark-text dark:text-dark-text-dark transition-all duration-300 origin-bottom-right animate-fade-in-up">
                    {moreMenuItems.map(item => (
                        <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className="flex items-center gap-3 p-2 rounded-md hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
                           <item.icon size={16} /> {item.name}
                        </a>
                    ))}
                    <div className="border-t my-1 border-border-color dark:border-border-color-dark"></div>
                    <button onClick={handleLanguageToggle} className="flex items-center gap-3 p-2 rounded-md hover:bg-light-bg dark:hover:bg-dark-bg w-full text-left transition-colors">
                       <Globe size={16} /> <span>Switch to {getNextToggleLanguage().name}</span>
                    </button>
                    <button onClick={handleThemeToggle} className="flex items-center gap-3 p-2 rounded-md hover:bg-light-bg dark:hover:bg-dark-bg w-full text-left transition-colors">
                       {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                    </button>
                </div>
            )}
            <div className="grid grid-cols-5 h-full">
                {visibleNavItems.map(item => (
                    <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className={`${getLinkClass(item.href, item.sectionId)} group`}>
                        <item.icon size={20} />
                        <span className="font-medium mt-1">{item.name}</span>
                    </a>
                ))}
                
                {/* Central Login Button - prominent position */}
                <div className="relative flex justify-center">
                    <Link to="/login" className="absolute -top-4 flex flex-col items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg border-4 border-light-bg dark:border-dark-bg transition-all duration-200 hover:scale-105">
                        <span className="text-sm font-bold">{t('header.login', 'Login')}</span>
                    </Link>
                </div>
                
                {/* More button to show hidden items and utilities */}
                <button onClick={() => setMoreMenuOpen(!isMoreMenuOpen)} className="flex flex-col items-center justify-center w-full h-full text-xs text-light-text dark:text-light-text-dark transition-colors duration-150">
                    <MoreHorizontal size={20} />
                    <span className="font-medium mt-1">More</span>
                </button>
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
