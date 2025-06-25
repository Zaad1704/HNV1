import React from "react";
import Trans from "./Trans";
import { Link } from 'react-router-dom'; // Import Link

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-light-card dark:bg-dark-card text-light-text dark:text-light-text-dark py-12 mt-12 transition-colors duration-300 border-t border-border-color dark:border-border-color-dark">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">ProManage Solutions</h3>
            <p className="text-sm">123 Property Lane, Suite 400<br />Management City, MC 54321</p>
            <p className="text-sm mt-2"><Trans en="Email:" bn="[ইমেইল:]" /> info@promanagesolutions.com</p>
            <p className="text-sm"><Trans en="Phone:" bn="[ফোন:]" /> (555) 123-4567</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3"><Trans en="Quick Links" bn="[দ্রুত লিঙ্ক]" /></h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"><Trans en="About Us" bn="[আমাদের সম্পর্কে]" /></Link></li>
              <li><Link to="/services" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"><Trans en="Services" bn="[সেবা সমূহ]" /></Link></li>
              <li><Link to="/leadership" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"><Trans en="Leadership" bn="[নেতৃত্ব]" /></Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"><Trans en="Contact Us" bn="[যোগাযোগ করুন]" /></Link></li>
              <li><Link to="/privacy" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"><Trans en="Privacy Policy" bn="[গোপনীয়তা নীতি]" /></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3"><Trans en="Newsletter" bn="[নিউজলেটার]" /></h3>
            <p className="text-sm mb-3"><Trans en="Stay updated with our latest news and offers." bn="[আমাদের সর্বশেষ খবর এবং অফারগুলির সাথে আপডেট থাকুন।]" /></p>
            <form className="flex">
              <input type="email" className="w-full px-3 py-2.5 rounded-l-lg text-dark-text dark:text-dark-text-dark bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-sm"
                placeholder="Enter your email" />
              <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2.5 rounded-r-lg font-semibold text-sm transition-colors">
                <Trans en="Subscribe" bn="[সাবস্ক্রাইব করুন]" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-border-color dark:border-border-color-dark pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {year} ProManage Solutions. <Trans en="All rights reserved." bn="[সর্বস্বত্ব সংরক্ষিত।]" /></p>
          <Link to="/login" className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors mt-4 md:mt-0"><Trans en="Portal Login" bn="[পোর্টাল লগইন]" /></Link>
        </div>
      </div>
    </footer>
  );
}
