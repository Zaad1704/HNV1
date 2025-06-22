// frontend/src/components/layout/PublicBottomNavBar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Mail, LogIn } from 'lucide-react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation();

    // Redefine navItems to prioritize Login in the middle
    const navItems = [
        { name: t('header.features'), href: '/#featuresPage', icon: Home, sectionId: 'featuresPage' },
        { name: t('header.about'), href: '/#aboutPage', icon: Info, sectionId: 'aboutPage' },
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login', highlight: true }, // Highlighted item
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: 'Contact', href: '/#contact', icon: Mail, sectionId: 'contact' },
    ];

    const sectionIds = navItems.filter(item => item.href && item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string, isHighlight?: boolean) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        let isActive = false;

        if (itemSectionId && location.pathname === '/') {
             isActive = activeSectionId === itemSectionId;
        } else if (!itemSectionId && itemHref) {
            isActive = location.pathname.startsWith(itemHref);
        }

        const activeClasses = 'text-brand-primary';
        const inactiveClasses = 'text-light-text';

        // Apply highlight specific classes
        if (isHighlight) {
            return `${base} bg-brand-primary text-white font-bold rounded-lg shadow-lg -mt-4 py-2 mx-1 transition-all duration-300 transform scale-110 flex-grow-0`; // Example highlight styles
        }

        return `${base} ${isActive ? activeClasses : inactiveClasses}`;
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
            <div className="flex justify-around items-center h-full px-2"> {/* Added px-2 for padding */}
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        className={getLinkClass(item.href, item.sectionId, item.highlight)}
                    >
                        <item.icon size={item.highlight ? 24 : 20} /> {/* Larger icon for highlighted */}
                        <span className="font-medium mt-1">{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
