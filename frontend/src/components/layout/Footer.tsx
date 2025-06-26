// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Footer = () => {
    const { data: settings } = useSiteSettings();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-light-card/60 dark:bg-dark-card/60 border-t border-border-color dark:border-border-color-dark mt-auto">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center text-center">
                    <Link to="/" className="flex items-center space-x-3 mb-4">
                        <img src={settings?.logos?.faviconUrl || "/logo-min.png"} alt="HNV Logo" className="h-8 w-8 rounded-md" />
                        <span className="text-lg font-semibold text-dark-text dark:text-dark-text-dark">
                            {settings?.logos?.companyName || "HNV Property Management"}
                        </span>
                    </Link>
                    <div className="flex space-x-6 mb-4">
                        <Link to="/terms" className="text-sm text-gray-600 hover:text-brand-primary dark:text-gray-400 dark:hover:text-brand-primary-dark">Terms & Conditions</Link>
                        <Link to="/privacy" className="text-sm text-gray-600 hover:text-brand-primary dark:text-gray-400 dark:hover:text-brand-primary-dark">Privacy Policy</Link>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">&copy; {currentYear} {settings?.logos?.companyName || "HNV Property Management"}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
