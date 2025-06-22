import React from "react";
import Trans from "../Trans";

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">
            <Trans en="Our Services" bn="আমাদের সেবাসমূহ" />
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <Trans
              en="Comprehensive solutions tailored for your property management needs."
              bn="আপনার সম্পত্তি পরিচালনার প্রয়োজনের জন্য বিশেষভাবে তৈরি ব্যাপক সমাধান।"
            />
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <div className="text-indigo-600 mb-4">
              {/* Users Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a8 8 0 0 0-12 0"/><circle cx="12" cy="11" r="4"/><rect width="16" height="18" x="4" y="3" rx="2"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <Trans en="Tenant Management" bn="[ভাড়াটে ব্যবস্থাপনা]" />
            </h3>
            <p className="text-gray-600">
              <Trans
                en="Efficiently track tenant information, lease agreements, and communication logs."
                bn="ভাড়াটেদের তথ্য, ইজারা চুক্তি এবং যোগাযোগের লগগুলি দক্ষতার সাথে ট্র্যাক করুন।"
              />
            </p>
          </div>
          {/* Service Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <div className="text-indigo-600 mb-4">
              {/* Home Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <Trans en="Property Tracking" bn="সম্পত্তি ট্র্যাকিং" />
            </h3>
            <p className="text-gray-600">
              <Trans
                en="Manage property details, maintenance schedules, and unit availability."
                bn="সম্পত্তির বিবরণ, রক্ষণাবেক্ষণের সময়সূচী এবং ইউনিটের প্রাপ্যতা পরিচালনা করুন।"
              />
            </p>
          </div>
          {/* Service Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <div className="text-indigo-600 mb-4">
              {/* Credit Card Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <Trans en="Rent Collection" bn="[ভাড়া সংগ্রহ]" />
            </h3>
            <p className="text-gray-600">
              <Trans
                en="Automate rent reminders, process online payments, and track financial records."
                bn="ভাড়ার অনুস্মারক স্বয়ংক্রিয় করুন, অনলাইন পেমেন্ট প্রক্রিয়া করুন এবং আর্থিক রেকর্ড ট্র্যাক করুন।"
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
