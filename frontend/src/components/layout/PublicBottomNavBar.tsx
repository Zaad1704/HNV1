import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Tag, Phone, LogIn, MoreHorizontal } from 'lucide-react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

    const navItems = [
        { name: t('header.features', 'Features'), href: '/#featuresPage', icon: Compass, sectionId: 'featuresPage' },
        { name: t('header.about', 'About'), href: '/#aboutPage', icon: Home, sectionId: 'aboutPage' },
        { name: t('header.pricing', 'Pricing'), href: '/#pricingSection', icon: Tag, sectionId: 'pricingSection' },
        { name: t('header.contact', 'Contact'), href: '/#contact', icon: Phone, sectionId: 'contact' },
    ];
    
    // Split items for layout
    const leftItems = navItems.slice(0, 2);
    const rightItems = navItems.slice(2, 3); // Just pricing
    const moreMenuItems = navItems.slice(3); // Contact and others

    const sectionIds = navItems.map(item => item.sectionId);
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string) => {
        const base = 'flex flex-col items-center justify-center w-full h-full text-xs transition-colors';
        const isActive = (itemSectionId && location.pathname === '/' && activeSectionId === itemSectionId);
        return `${base} ${isActive ? 'text-brand-primary' : 'text-light-text group-hover:text-brand-primary'}`;
    };

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        setMoreMenuOpen(false); // Close menu on click
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
            {isMoreMenuOpen && (
                <div className="absolute bottom-16 right-4 w-40 bg-white rounded-lg shadow-lg border border-border-color p-2">
                    {moreMenuItems.map(item => (
                        <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                           <item.icon size={16} /> {item.name}
                        </a>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-5 h-full">
                {/* Left Items */}
                {leftItems.map(item => (
                    <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className={`${getLinkClass(item.href, item.sectionId)} group`}>
                        <item.icon size={20} />
                        <span className="font-medium mt-1">{item.name}</span>
                    </a>
                ))}
                
                {/* Centered Login Button */}
                <div className="relative flex justify-center">
                    <Link to="/login" className="absolute -top-4 flex flex-col items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg border-4 border-light-bg">
                        <LogIn size={24} />
                    </Link>
                </div>
                
                {/* Right Items */}
                {rightItems.map(item => (
                     <a key={item.name} href={item.href} onClick={(e) => handleScroll(e, item.href)} className={`${getLinkClass(item.href, item.sectionId)} group`}>
                        <item.icon size={20} />
                        <span className="font-medium mt-1">{item.name}</span>
                    </a>
                ))}

                {/* More Button */}
                <button onClick={() => setMoreMenuOpen(!isMoreMenuOpen)} className="flex flex-col items-center justify-center w-full h-full text-xs text-light-text">
                    <MoreHorizontal size={20} />
                    <span className="font-medium mt-1">More</span>
                </button>
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
