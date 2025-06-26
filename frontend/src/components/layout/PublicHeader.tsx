// frontend/src/components/layout/PublicHeader.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext'; // Assuming this context exists
import { useLang } from '../../contexts/LanguageContext'; // Assuming this context exists

const PublicHeader = () => {
    const { data: settings } = useSiteSettings();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { setLang, getNextToggleLanguage } = useLang();
    const location = useLocation();

    const navLinks = [
        { name: t('header.about', 'About'), href: '#about' },
        { name: t('header.services', 'Services'), href: '#services' },
        { name: t('header.pricing', 'Pricing'), href: '#pricing' },
        { name: t('header.contact', 'Contact'), href: '#contact' },
    ];

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-border-color dark:border-border-color-dark transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo and Company Name */}
                    <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
                        <img src={settings?.logos?.faviconUrl || "/logo-min.png"} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
                        <span className="hidden md:block text-xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.logos?.companyName || "HNV Solutions"}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:space-x-8">
                        {navLinks.map(link => (
                            <a key={link.name} href={link.href} onClick={(e) => handleScroll(e, link.href)} className="font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary-dark transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary-dark transition-colors">
                            {t('header.login', 'Log In')}
                        </Link>
                        <Link to="/register" className="px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">
                            {t('header.get_started', 'Get Started')}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-light-card dark:bg-dark-card shadow-lg border-t border-border-color dark:border-border-color-dark transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-y-0' : 'transform -translate-y-[150%]'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} onClick={(e) => handleScroll(e, link.href)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                            {link.name}
                        </a>
                    ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="mt-3 px-2 space-y-2">
                         <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                        </button>
                         <button onClick={() => setLang(getNextToggleLanguage().code)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
                           <Globe size={18} /> <span>Switch to {getNextToggleLanguage().name}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;
