import React from "react";
import Trans from "../Trans";

export default function LeadershipSection() {
  return (
    <section id="leadership" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">
            <Trans en="Meet Our Leadership" bn="[আমাদের নেতৃত্বের সাথে পরিচিত হন]" />
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <Trans
              en="The driving force behind ProManage Solutions, committed to excellence and innovation."
              bn="[ProManage Solutions এর চালিকা শক্তি, শ্রেষ্ঠত্ব এবং উদ্ভাবনের প্রতি প্রতিশ্রুতিবদ্ধ।]"
            />
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Leader 1 */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img
              src="https://placehold.co/150x150/7C3AED/FFFFFF?text=CEO"
              alt="Jane Doe - CEO"
              className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-indigo-200 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">Jane Doe</h3>
            <p className="text-indigo-600 font-medium mb-2">
              <Trans en="Chief Executive Officer" bn="[প্রধান নির্বাহী কর্মকর্তা]" />
            </p>
            <p className="text-gray-600 text-sm">
              <Trans
                en='"Leading with vision to redefine property management through technology and customer-centric solutions."'
                bn='"[প্রযুক্তি এবং গ্রাহক-কেন্দ্রিক সমাধানের মাধ্যমে সম্পত্তি ব্যবস্থাপনাকে নতুনভাবে সংজ্ঞায়িত করার দৃষ্টি নিয়ে নেতৃত্ব দেওয়া।]"'
              />
            </p>
          </div>
          {/* Leader 2 */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img
              src="https://placehold.co/150x150/EC4899/FFFFFF?text=CTO"
              alt="John Smith - CTO"
              className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-pink-200 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">John Smith</h3>
            <p className="text-pink-600 font-medium mb-2">
              <Trans en="Chief Technology Officer" bn="[প্রধান প্রযুক্তি কর্মকর্তা]" />
            </p>
            <p className="text-gray-600 text-sm">
              <Trans
                en='"Innovating at the forefront of tech to build robust and scalable platforms for our users."'
                bn='"[আমাদের ব্যবহারকারীদের জন্য শক্তিশালী এবং পরিমাপযোগ্য প্ল্যাটফর্ম তৈরি করতে প্রযুক্তির অগ্রভাগে উদ্ভাবন করা।]"'
              />
            </p>
          </div>
          {/* Leader 3 */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg text-center hover:-translate-y-1 hover:shadow-xl transition duration-300">
            <img
              src="https://placehold.co/150x150/10B981/FFFFFF?text=COO"
              alt="Alice Brown - COO"
              className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-emerald-200 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">Alice Brown</h3>
            <p className="text-emerald-600 font-medium mb-2">
              <Trans en="Chief Operations Officer" bn="[প্রধান পরিচালন কর্মকর্তা]" />
            </p>
            <p className="text-gray-600 text-sm">
              <Trans
                en='"Ensuring operational excellence and seamless service delivery for all our clients."'
                bn='"[আমাদের সকল ক্লায়েন্টদের জন্য পরিচালনগত শ্রেষ্ঠত্ব এবং নির্বিঘ্ন পরিষেবা সরবরাহ নিশ্চিত করা।]"'
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
