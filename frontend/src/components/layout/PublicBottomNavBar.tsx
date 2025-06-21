// frontend/src/components/layout/PublicBottomNavBar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Mail, LogIn } from 'lucide-react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next'; // Import useTranslation for translation keys

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation(); // Initialize useTranslation

    // Define public navigation items with their target section IDs
    // Login link stays here for mobile bottom nav
    const navItems = [
        { name: t('header.features'), href: '/#featuresPage', icon: Home, sectionId: 'featuresPage' },
        { name: t('header.about'), href: '/#aboutPage', icon: Info, sectionId: 'aboutPage' },
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: 'Contact', href: '/#contact', icon: Mail, sectionId: 'contact' }, // Assuming 'Contact' is not in header.contact for simplicity, or use t()
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login' }, // Direct link to login page
    ];

    const sectionIds = navItems.filter(item => item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        let isActive = false;

        if (itemSectionId && location.pathname === '/') {
             isActive = activeSectionId === itemSectionId;
        } else if (!itemSectionId) {
            isActive = location.pathname.startsWith(itemHref);
        }

        return `${base} ${isActive ? 'text-brand-primary' : 'text-light-text'}`;
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-t-lg z-30">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        className={getLinkClass(item.href, item.sectionId)}
                    >
                        <item.icon size={20} />
                        <span className="font-medium mt-1">{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
