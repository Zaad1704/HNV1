// frontend/src/components/layout/PublicBottomNavBar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Mail, LogIn, UserPlus } from 'lucide-react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        { name: t('header.features'), href: '/#featuresPage', icon: Home, sectionId: 'featuresPage' },
        { name: t('header.about'), href: '/#aboutPage', icon: Info, sectionId: 'aboutPage' },
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login', isCrown: true }, // Central Crown Login button
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: t('header.contact'), href: '/#contact', icon: Mail, sectionId: 'contact' },
    ];

    const sectionIds = navItems.filter(item => item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    // This function will ONLY return the className string
    const getLinkClassesString = (itemHref: string, itemSectionId?: string, isCrown?: boolean) => {
        let isActive = false; 

        if (itemSectionId && location.pathname === '/') {
             isActive = activeSectionId === itemSectionId;
        } else if (!itemSectionId) {
            isActive = location.pathname.startsWith(itemHref);
        }

        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const activeColor = isActive ? 'text-brand-primary' : 'text-light-text';
        const crownActiveColor = isCrown && isActive ? 'text-white' : (isCrown ? 'text-white' : activeColor);

        // NEW: Apply all crown-specific classes directly here, no inline style for them
        const crownClasses = isCrown ? 
            'flex-grow-0 w-16 h-16 -mt-4 mx-2 rounded-xl text-white shadow-md relative z-20 flex-shrink-0 ' + // Base size, shadow, positioning
            'bg-brand-primary border-4 border-light-card ' + // Colors for the crown background/border
            'transform hover:scale-105 transition-transform duration-200 ease-in-out' : 
            'flex-grow'; // Default for non-crowned items

        return `${base} ${activeColor} ${crownClasses} ${crownActiveColor} dark:text-light-text-dark dark:border-border-color-dark dark:bg-dark-card ${isCrown ? 'dark:bg-brand-primary dark:border-dark-bg' : ''}`;
    };

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        if (href.startsWith('/#')) {
            e.preventDefault();
            const targetId = href.substring(2);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30 dark:bg-dark-card dark:border-border-color-dark">
            <div className="flex justify-around items-end h-full">
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={getLinkClassesString(item.href, item.sectionId, item.isCrown)} // Pass classes string here
                        // NEW: Apply background-image directly in style prop if it's a crown
                        style={item.isCrown ? { 
                            backgroundImage: `url('/crowned-badge-bg.png')`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        } : undefined} // Only apply style if it's a crown
                    >
                        <div className={`flex flex-col items-center justify-center ${item.isCrown ? 'w-full h-full' : 'p-1'}`}>
                            <item.icon size={item.isCrown ? 24 : 20} strokeWidth={item.isCrown ? 2.5 : 2} />
                            <span className={`font-medium mt-1 ${item.isCrown ? 'text-white text-xs' : ''}`}>{item.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
