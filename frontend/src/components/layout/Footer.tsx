import React from 'react';
import { Link } from 'react-router-dom';
// FIX: Adjusted import path to relative for useSiteSettings
import { useSiteSettings } from '../../hooks/useSiteSettings'; 

const Footer = () => {
    const { data: settings, isLoading } = useSiteSettings();

    if (isLoading || !settings?.footer) return null;

    const renderLinks = (links: { text: string; url: string }[] = []) => (
        <ul className="space-y-2">
            {links.map(link => (
                <li key={link.text}>
                    {link.url.startsWith('/') ? (
                        // If it's an internal link, use React Router's Link
                        <Link to={link.url} className="hover:text-cyan-400">{link.text}</Link>
                    ) : (
                        // If it's an external link, use a regular anchor tag
                        <a href={link.url} className="hover:text-cyan-400" target="_blank" rel="noopener noreferrer">{link.text}</a>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        {/* FIX: Wrap the footer logo with a Link to the homepage */}
                        <Link to="/"> 
                            <img src={settings.logos?.footerLogoUrl} alt="Company Logo" className="h-8 mb-4 filter grayscale brightness-150"/>
                        </Link>
                        <p className="max-w-md">{settings.footer.description}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Quick Links</h3>
                        {renderLinks(settings.footer.quickLinks)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Legal</h3>
                        {renderLinks(settings.footer.legalLinks)}
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} {settings.footer.copyrightText}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
