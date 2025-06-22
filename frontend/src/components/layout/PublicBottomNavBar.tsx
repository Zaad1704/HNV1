import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function HeaderMobileLanding() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-indigo-700 px-2 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-white text-lg">HNV</Link>
      <nav className="flex-1 flex justify-center items-center space-x-1">
        <Link to="#services" className="text-white px-2 py-1 text-sm">{t("header.services")}</Link>
        <Link to="#leadership" className="text-white px-2 py-1 text-sm">{t("header.leadership")}</Link>
        <Link to="#install-app" className="text-white px-2 py-1 text-sm">{t("header.install_app")}</Link>
      </nav>
      <div className="flex items-center space-x-2">
        {/* Highlighted Login Button */}
        <Link
          to="/login"
          className="bg-white text-indigo-700 font-bold px-4 py-1.5 rounded-full shadow border-2 border-indigo-700 text-base mx-auto"
          style={{ minWidth: 90, textAlign: "center" }}
        >
          {t("header.login")}
        </Link>
        {/* Hamburger for more */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="ml-2 focus:outline-none"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Drawer/Dropdown for secondary links */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg w-44 z-50">
          <Link to="#about" className="block px-4 py-2 text-gray-800">{t('header.about')}</Link>
          <Link to="#pricing" className="block px-4 py-2 text-gray-800">{t('header.pricing')}</Link>
          <Link to="#contact" className="block px-4 py-2 text-gray-800">{t('header.contact')}</Link>
          <Link to="/signup" className="block px-4 py-2 text-indigo-700 font-bold">{t('header.sign_up')}</Link>
        </div>
      )}
    </header>
  );
}
