import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { data: settings, isLoading } = useSiteSettings();
    const { t } = useTranslation();

    if (isLoading || !settings?.footer) return null;

    // Helper to render lists of links
    const renderLinks = (links: { text: string; url: string }[] = []) => (
        <ul className="space-y-2">
            {links.map(link => (
                <li key={link.url}>
                    {/* Checks if the link is internal (starts with '/') or external */}
                    {link.url.startsWith('/') ? (
                        <Link to={link.url} className="text-slate-400 hover:text-brand-primary transition-colors">
                            {link.text}
                        </Link>
                    ) : (
                        <a href={link.url} className="text-slate-400 hover:text-brand-primary transition-colors" target="_blank" rel="noopener noreferrer">
                            {link.text}
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <footer className="bg-brand-dark border-t border-slate-800">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Column 1: Branding */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            <img src={settings.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-8 filter brightness-0 invert" />
                            <span className="text-xl font-bold text-white">{settings.logos?.companyName}</span>
                        </Link>
                        <p className="text-slate-400 text-sm max-w-xs">{settings.footer.description}</p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">{t('footer.quick_links')}</h3>
                        {renderLinks(settings.footer.quickLinks)}
                    </div>
                    
                    {/* Column 3: Legal Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">{t('footer.legal_links')}</h3>
                        {renderLinks(settings.footer.legalLinks)}
                    </div>
                    
                    {/* Column 4: Social Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">{t('footer.social_links')}</h3>
                        {renderLinks(settings.footer.socialLinks)}
                    </div>
                </div>
                <div className="mt-16 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {settings.footer.copyrightText}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
