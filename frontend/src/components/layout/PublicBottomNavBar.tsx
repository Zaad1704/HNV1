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
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login', isCrown: true },
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: t('header.contact'), href: '/#contact', icon: Mail, sectionId: 'contact' },
    ];

    const sectionIds = navItems.filter(item => item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string, isCrown?: boolean) => {
        let isActive = false; // --- CHANGE: 'const' to 'let' ---

        if (itemSectionId && location.pathname === '/') {
             isActive = activeSectionId === itemSectionId;
        } else if (!itemSectionId) {
            isActive = location.pathname.startsWith(itemHref);
        }

        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const activeColor = isActive ? 'text-brand-primary' : 'text-light-text';

        const crownStyle = isCrown ? {
            flexGrow: 0,
            width: '24px',
            height: '24px',
            marginTop: '-10px',
            marginLeft: '8px',
            marginRight: '8px',
            borderRadius: '12px',
            backgroundColor: 'rgb(79, 70, 229)',
            border: '4px solid white',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            position: 'relative',
            zIndex: 20,
            flexShrink: 0,
            backgroundImage: `url('/crowned-badge-bg.png')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transform: 'scale(1.05)',
            transitionProperty: 'transform',
            transitionDuration: '200ms',
            transitionTimingFunction: 'ease-in-out',
        } : { flexGrow: 1 };

        const crownActiveColor = isCrown && isActive ? 'text-white' : (isCrown ? 'text-white' : activeColor);

        return `${base} ${activeColor} dark:text-light-text-dark dark:border-border-color-dark dark:bg-dark-card`;
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
                        onClick={(e) => handleScroll(e, item.href)}
                        className={getLinkClass(item.href, item.sectionId, item.isCrown)}
                        style={item.isCrown ? getLinkClass(item.href, item.sectionId, item.isCrown) : {}}
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
