// frontend/src/components/layout/PublicBottomNavBar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Mail, LogIn, UserPlus } from 'lucide-react'; // Added UserPlus for Signup
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation();

    // Define public navigation items with their target section IDs
    // Restructured to place Login/Signup in the center
    const navItems = [
        { name: t('header.features'), href: '/#featuresPage', icon: Home, sectionId: 'featuresPage' },
        { name: t('header.about'), href: '/#aboutPage', icon: Info, sectionId: 'aboutPage' },
        // Central Login/Signup "crown" element
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login', isCrown: true },
        // { name: t('header.sign_up'), href: '/register', icon: UserPlus, sectionId: 'signup', isCrown: true }, // Optional: If signup should also be a crown
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: t('header.contact'), href: '/#contact', icon: Mail, sectionId: 'contact' },
    ];

    const sectionIds = navItems.filter(item => item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string, isCrown?: boolean) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        let isActive = false;

        if (itemSectionId && location.pathname === '/') {
             isActive = activeSectionId === itemSectionId;
        } else if (!itemSectionId) { // For direct path links like /login
            isActive = location.pathname.startsWith(itemHref);
        }

        const activeColor = isActive ? 'text-brand-primary' : 'text-light-text';
        const crownStyle = isCrown ? 'flex-grow-0 w-20 h-20 -mt-8 mx-2 rounded-full bg-brand-primary border-4 border-light-card text-white shadow-lg relative z-20 flex-shrink-0' : 'flex-grow';
        const crownActiveColor = isCrown && isActive ? 'text-white' : (isCrown ? 'text-white' : activeColor); // Crown is always white text

        return `${base} ${activeColor} ${crownStyle} ${crownActiveColor} dark:text-light-text-dark dark:border-border-color-dark dark:bg-dark-card`; // Added dark mode classes
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30 dark:bg-dark-card dark:border-border-color-dark"> {/* Added dark mode classes */}
            <div className="flex justify-around items-end h-full"> {/* Changed align-items to end for crown effect */}
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        className={getLinkClass(item.href, item.sectionId, item.isCrown)}
                    >
                        <div className={`flex flex-col items-center justify-center ${item.isCrown ? 'w-full h-full' : 'p-1'}`}>
                            <item.icon size={item.isCrown ? 28 : 20} strokeWidth={item.isCrown ? 2.5 : 2} />
                            <span className={`font-medium mt-1 ${item.isCrown ? 'text-white text-xs' : ''}`}>{item.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
