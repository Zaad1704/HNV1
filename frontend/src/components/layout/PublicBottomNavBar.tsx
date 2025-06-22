import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Mail, LogIn, UserPlus } from 'lucide-react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        { name: t('header.features'), href: '/#featuresPage', icon: Home, sectionId: 'featuresPage' },
        { name: t('header.pricing'), href: '/#pricingSection', icon: DollarSign, sectionId: 'pricingSection' },
        { name: t('header.login'), href: '/login', icon: LogIn, sectionId: 'login', isHighlight: true }, // Explicitly highlight Login
        { name: t('header.sign_up'), href: '/register', icon: UserPlus, sectionId: 'register' },
        { name: t('header.contact'), href: '/#contact', icon: Mail, sectionId: 'contact' }, // Use translation key for Contact
    ];

    const sectionIds = navItems.filter(item => item.href && item.href.startsWith('/#')).map(item => item.sectionId || '');
    const activeSectionId = useScrollSpy(sectionIds, 150);

    const getLinkClass = (itemHref: string, itemSectionId?: string, isHighlight?: boolean) => {
        const base = 'flex flex-col items-center justify-center text-xs transition-colors h-full px-1 flex-1 relative z-10'; // Added relative z-10 for layering
        const isActive = (itemSectionId && location.pathname === '/' && activeSectionId === itemSectionId) ||
                         (itemHref && location.pathname.startsWith(itemHref)); // Check for active hash or direct path

        // Styling for the highlighted item (Login)
        if (isHighlight) {
            return `
                ${base}
                bg-brand-primary text-white font-bold rounded-lg shadow-lg
                -mt-4 py-2 mx-1
                transition-all duration-300 transform scale-110
                flex-grow-0
                relative overflow-hidden
                before:content-[''] before:absolute before:inset-0
                before:bg-[url('/crowned-badge-bg.png')] before:bg-no-repeat before:bg-center before:bg-contain
                before:opacity-20 before:z-0
            `;
        }
        // Styling for non-highlighted items
        return `${base} ${isActive ? 'text-brand-primary font-semibold' : 'text-light-text hover:text-dark-text'}`;
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
            <div className="flex justify-around items-start h-full px-2"> {/* items-start to push text down from highlighted item */}
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        className={getLinkClass(item.href, item.sectionId, item.isHighlight)}
                    >
                        <item.icon size={item.isHighlight ? 24 : 20} className={item.isHighlight ? "text-white" : ""} /> {/* Ensure icon color for highlighted */}
                        <span className="font-medium mt-1 text-inherit">{item.name}</span> {/* text-inherit to keep color from parent */}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default PublicBottomNavBar;
