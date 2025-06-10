import React from "react";
import Trans from "./Trans";
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-gray-300 py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">ProManage Solutions</h3>
            <p className="text-sm">123 Property Lane, Suite 400<br />Management City, MC 54321</p>
            <p className="text-sm mt-2"><Trans en="Email:" bn="[ইমেইল:]" /> info@promanagesolutions.com</p>
            <p className="text-sm"><Trans en="Phone:" bn="[ফোন:]" /> (555) 123-4567</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-3"><Trans en="Quick Links" bn="[দ্রুত লিঙ্ক]" /></h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-indigo-400 transition-colors"><Trans en="About Us" bn="[আমাদের সম্পর্কে]" /></a></li>
              <li><a href="/services" className="hover:text-indigo-400 transition-colors"><Trans en="Services" bn="[সেবা সমূহ]" /></a></li>
              <li><a href="/leadership" className="hover:text-indigo-400 transition-colors"><Trans en="Leadership" bn="[নেতৃত্ব]" /></a></li>
              <li><a href="/contact" className="hover:text-indigo-400 transition-colors"><Trans en="Contact Us" bn="[যোগাযোগ করুন]" /></a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors"><Trans en="Privacy Policy" bn="[গোপনীয়তা নীতি]" /></a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-3"><Trans en="Newsletter" bn="[নিউজলেটার]" /></h3>
            <p className="text-sm mb-3"><Trans en="Stay updated with our latest news and offers." bn="[আমাদের সর্বশেষ খবর এবং অফারগুলির সাথে আপডেট থাকুন।]" /></p>
            <form className="flex">
              <input type="email" className="w-full px-3 py-2.5 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Enter your email" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-r-lg font-semibold text-sm transition-colors">
                <Trans en="Subscribe" bn="[সাবস্ক্রাইব করুন]" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {year} ProManage Solutions. <Trans en="All rights reserved." bn="[সর্বস্বত্ব সংরক্ষিত।]" /></p>
          <a href="/login" className="text-gray-500 hover:text-indigo-400 transition-colors mt-4 md:mt-0"><Trans en="Portal Login" bn="[পোর্টাল লগইন]" /></a>
        </div>
      </div>
    </footer>
  );
}
