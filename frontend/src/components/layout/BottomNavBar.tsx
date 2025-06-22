import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export default function HeaderMobileDashboard() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-indigo-700 px-2 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="font-bold text-white text-lg">HNV</Link>
      <nav className="flex-1 flex justify-center items-center space-x-1">
        {/* Highlighted Home Button */}
        <Link
          to="/dashboard"
          className={`font-bold px-4 py-1.5 rounded-full border-2 shadow text-base mx-auto ${
            location.pathname === "/dashboard"
              ? "bg-white text-indigo-700 border-indigo-700"
              : "bg-indigo-500 text-white border-indigo-500"
          }`}
          style={{ minWidth: 90, textAlign: "center" }}
        >
          {t("dashboard.overview")}
        </Link>
      </nav>
      <div className="flex items-center space-x-2">
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
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg w-44 z-50">
          <Link to="/properties" className="block px-4 py-2 text-gray-800">{t('dashboard.properties')}</Link>
          <Link to="/tenants" className="block px-4 py-2 text-gray-800">{t('dashboard.tenants')}</Link>
          <Link to="/expenses" className="block px-4 py-2 text-gray-800">{t('dashboard.expenses')}</Link>
          <Link to="/maintenance" className="block px-4 py-2 text-gray-800">{t('dashboard.maintenance')}</Link>
          <Link to="/profile" className="block px-4 py-2 text-gray-800">{t('dashboard.settings')}</Link>
          <Link to="/logout" className="block px-4 py-2 text-red-600 font-bold">{t('dashboard.logout')}</Link>
        </div>
      )}
    </header>
  );
}
