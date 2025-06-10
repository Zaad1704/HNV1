import React from "react";
import { NavLink } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";
import Trans from "./Trans";
const navLinks = [
  { to: "/", en: "Home", bn: "[বেঙ্গলি হোম]" },
  { to: "/about", en: "About Us", bn: "[আমাদের সম্পর্কে]" },
  { to: "/services", en: "Services", bn: "[সেবা সমূহ]" },
  { to: "/contact", en: "Contact", bn: "[যোগাযোগ]" },
];
export default function Navbar() {
  const { lang, setLang } = useLang();
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <div className="flex items-center">
          <img src="https://placehold.co/40x40/4F46E5/FFFFFF?text=PM" alt="ProManage Logo" className="h-10 w-10 rounded-md mr-3" />
          <span className="font-bold text-2xl text-indigo-600">ProManage Solutions</span>
        </div>
        <nav className="hidden md:flex space-x-1 items-center">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) =>
                `text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-md font-medium transition-colors ${isActive ? 'font-bold text-indigo-600' : ''}`
              }>
              <Trans en={link.en} bn={link.bn} />
            </NavLink>
          ))}
          <div className="ml-4 flex items-center space-x-2">
            <button onClick={() => setLang("en")} className={`px-3 py-1 border rounded-md text-sm font-medium ${lang === "en" ? "border-indigo-600 text-indigo-600 bg-indigo-50" : "border-gray-400 text-gray-500"}`}>EN</button>
            <button onClick={() => setLang("bn")} className={`px-3 py-1 border rounded-md text-sm font-medium ${lang === "bn" ? "border-indigo-600 text-indigo-600 bg-indigo-50" : "border-gray-400 text-gray-500"}`}>BN</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
