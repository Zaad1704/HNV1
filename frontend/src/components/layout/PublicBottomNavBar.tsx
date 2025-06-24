import React, { useState } from 'react';
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
    
    // FIX: Import theme and language hooks
    const { theme, toggleTheme } = useTheme();
    const { setLang, getNextToggleLanguage } = useLang();

    const navItems = [
        { name: t('header.features', 'Features'), href: '/#featuresPage', icon: Compass, sectionId: 'featuresPage' },
        { name: t('header.about', 'About'), href: '/#aboutPage', icon: Home, sectionId: 'aboutPage' },
        { name: t('header.pricing', 'Pricing'), href: '/#pricingSection', icon: Tag, sectionId: 'pricingSection' },
        { name: t('header.contact', 'Contact'), href: '/#contact', icon: Phone, sectionId: 'contact' },
    ];
    
    const leftItems = navItems.slice(0, 2);
    const rightItems = navItems.slice(2, 3);
    const moreMenuItems = navItems.slice(3);

    const sectionIds = navItems.map(item => item.sectionId);
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const isActive = (itemSectionId && location.pathname === '/' && activeSectionId === itemSectionId);
        return `${base} ${isActive ? 'text-brand-primary' : 'text-light-text group-hover:text-brand-primary'}`;
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
        }
    };

    // FIX: Handlers for new menu buttons
    const handleLanguageToggle = () => {
        setLang(getNextToggleLanguage().code);
        setMoreMenuOpen(false);
    };

    const handleThemeToggle = () => {
        toggleTheme();
        setMoreMenuOpen(false);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            {isMoreMenuOpen && (
                // FIX: Added theme and language toggles to the "More" menu
                <div className="absolute bottom-16 right-4 w-48 bg-white rounded-lg shadow-xl border border-border-color p-2 text-sm text-gray-800">
                    {moreMenuItems.map(item => (
                        <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                           <item.icon size={16} /> {item.name}
                        </a>
                    ))}
                    <div className="border-t my-1 border-gray-200"></div>
                    <button onClick={handleLanguageToggle} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 w-full text-left">
                       <Globe size={16} /> <span>Switch Language</span>
                    </button>
                    <button onClick={handleThemeToggle} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 w-full text-left">
                       {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                    </button>
                </div>
            )}
            <div className="grid grid-cols-5 h-full">
                {leftItems.map(item => (
                    <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className={`${getLinkClass(item.href, item.sectionId)} group`}>
                        <item.icon size={20} />
                        <span className="font-medium mt-1">{item.name}</span>
                    </a>
                ))}
                
                <div className="relative flex justify-center">
                    <Link to="/login" className="absolute -top-4 flex flex-col items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg border-4 border-light-bg">
                        <span className="text-sm font-bold">Login</span>
                    </Link>
                </div>
                
                {rightItems.map(item => (
                     <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className={`${getLinkClass(item.href, item.sectionId)} group`}>
                        <item.icon size={20} />
                        <span className="font-medium mt-1">{item.name}</span>
                    </a>
                ))}

                <button onClick={() => setMoreMenuOpen(!isMoreMenuOpen)} className="flex flex-col items-center justify-center w-full h-full text-xs text-light-text">
                    <MoreHorizontal size={20} />
                    <span className="font-medium mt-1">More</span>
                </button>
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
