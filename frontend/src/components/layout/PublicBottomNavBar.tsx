// frontend/src/components/layout/PublicBottomNavBar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Mail, LogIn, UserPlus, FileText } from 'lucide-react'; // Added UserPlus, FileText
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
    const location = useLocation();
    const { t } = useTranslation();

    // Redefine navItems to include all relevant public sections.
    // Order is adjusted to keep highlighted 'Login' central.
    // Abbreviate labels if necessary to fit.
    const navItems = [
        { name: t('header.features'), href: '/#featuresPage', icon: Home, sectionId: 'featuresPage' },
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login', highlight: true }, // Highlighted
        { name: t('header.sign_up'), href: '/register', icon: UserPlus, sectionId: 'register' }, // Added Sign Up
        { name: 'Contact', href: '/#contact', icon: Mail, sectionId: 'contact' },
        // Consider adding Privacy/Terms here if you want them on the bottom nav.
        // { name: 'Privacy', href: '/privacy', icon: FileText, sectionId: 'privacy' },
        // { name: 'Terms', href: '/terms', icon: FileText, sectionId: 'terms' },
    ];

    const sectionIds = navItems.filter(item => item.href && item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string, isHighlight?: boolean) => {
        const base = 'flex flex-col items-center justify-center text-xs transition-colors h-full px-1 flex-1'; // flex-1 to distribute space
        let isActive = false;

        if (itemSectionId && location.pathname === '/') {
             isActive = activeSectionId === itemSectionId;
        } else if (itemHref) { // Check for direct links too
            isActive = location.pathname.startsWith(itemHref);
        }

        const activeClasses = 'text-brand-primary';
        const inactiveClasses = 'text-light-text';

        if (isHighlight) {
            return `${base} bg-brand-primary text-white font-bold rounded-lg shadow-lg -mt-4 py-2 mx-1 transition-all duration-300 transform scale-110 flex-grow-0 relative overflow-hidden ` +
                   `before:content-[''] before:absolute before:inset-0 before:bg-no-repeat before:bg-center before:bg-contain before:opacity-20 before:z-0 ` +
                   `before:bg-[url('/crowned-badge-bg.png')]`;
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
            <div className="flex justify-around items-center h-full px-2">
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        className={getLinkClass(item.href, item.sectionId, item.highlight)}
                    >
                        <item.icon size={item.highlight ? 24 : 20} />
                        <span className="font-medium mt-1">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
