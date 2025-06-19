// frontend/src/components/Navbar.tsx

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { data: settings } = useSiteSettings();

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'About Us', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-medium transition-colors ${
      isActive
        ? 'text-yellow-400'
        : 'text-slate-300 hover:text-yellow-400'
    }`;

  return (
    <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl} alt="HNV Logo" className="h-10" />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.href} className={getLinkClass}>
              {link.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="font-semibold text-white hover:text-yellow-400">
            Portal Log In
          </Link>
          <Link
            to="/register"
            className="font-bold text-slate-900 bg-yellow-500 hover:bg-yellow-400 py-2 px-5 rounded-lg flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile menu button can be added here if needed */}
      </div>
    </header>
  );
};

export default Navbar;
