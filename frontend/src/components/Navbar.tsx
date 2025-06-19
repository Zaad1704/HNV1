// frontend/src/components/Navbar.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useScrollSpy } from '../hooks/useScrollSpy'; // Import the new hook
import { ArrowRight, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'About Us', href: '#about' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  // Use the hook to track the active section
  const sectionIds = navLinks.map(link => link.href.substring(1));
  const activeId = useScrollSpy(sectionIds, 150); // Offset of 150px from the top

  const NavLinksContent = () => (
    <>
      {navLinks.map((link) => {
        const isActive = activeId === link.href.substring(1);
        return (
          <a
            key={link.name}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className={`font-medium transition-colors px-3 py-2 rounded-md ${
              isActive
                ? 'text-slate-900 bg-yellow-400'
                : 'text-slate-300 hover:text-yellow-400'
            }`}
          >
            {link.name}
          </a>
        );
      })}
    </>
  );

  return (
    <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <a href="#hero" className="flex items-center space-x-3">
          <img 
            src={settings?.logos?.navbarLogoUrl} 
            alt="Company Logo" 
            className="h-10" 
          />
          <span className="text-xl font-bold text-white hidden sm:inline">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </a>
        
        <nav className="hidden md:flex items-center space-x-6">
          <NavLinksContent />
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

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-slate-800 flex flex-col items-center space-y-4 py-6">
          <NavLinksContent />
        </nav>
      )}
    </header>
  );
};

export default Navbar;
