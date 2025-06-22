import React from "react";
import Trans from "../Trans";

export default function AboutSection() {
  return (
    // FIX: Change id to 'aboutPage' to match Navbar.tsx link
    <section id="aboutPage" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4">
            <Trans en="About ProManage Solutions" bn="[ProManage Solutions সম্পর্কে]" />
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <Trans
              en="We are dedicated to simplifying property management for owners, agents, and tenants."
              bn="[আমরা মালিক, এজেন্ট এবং ভাড়াটেদের জন্য সম্পত্তি পরিচালনা সহজ করতে প্রতিশ্রুতিবদ্ধ।]"
            />
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src="https://placehold.co/600x400/A5B4FC/FFFFFF?text=Our+Team+Working"
              alt="Team Collaboration"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">
                <Trans en="Our Mission" bn="[আমাদের লক্ষ্য]" />
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <Trans
                  en="To provide innovative and user-friendly technology solutions that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability. We strive to be the trusted partner in transforming the complexities of property management into streamlined, efficient processes."
                  bn="[উদ্ভাবনী এবং ব্যবহারকারী-বান্ধব প্রযুক্তি সমাধান সরবরাহ করা যা সম্পত্তি পরিচালকদের পরিচালনগত শ্রেষ্ঠত্ব অর্জন, ভাড়াটে সন্তুষ্টি বৃদ্ধি এবং লাভজনকতা সর্বাধিক করতে সক্ষম করে। আমরা সম্পত্তি ব্যবস্থাপনার জটিলতাগুলিকে সুবিন্যস্ত, দক্ষ প্রক্রিয়াগুলিতে রূপান্তরিত করার ক্ষেত্রে বিশ্বস্ত অংশীদার হতে চেষ্টা করি।]"
                />
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">
                <Trans en="Our Vision" bn="[আমাদের দৃষ্টি]" />
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <Trans
                  en="To be the leading global platform for property management, recognized for our commitment to customer success, continuous innovation, and the creation of thriving communities. We envision a future where managing properties is effortless, transparent, and accessible to everyone, everywhere."
                  bn="[সম্পত্তি ব্যবস্থাপনার জন্য শীর্ষস্থানীয় বিশ্বব্যাপী প্ল্যাটফর্ম হওয়া, গ্রাহক সাফল্য, ক্রমাগত উদ্ভাবন এবং সমৃদ্ধ সম্প্রদায়ের সৃষ্টির প্রতি আমাদের প্রতিশ্রুতির জন্য স্বীকৃত। আমরা এমন একটি ভবিষ্যতের কল্পনা করি যেখানে সম্পত্তি পরিচালনা অনায়াস, স্বচ্ছ এবং সর্বত্র প্রত্যেকের জন্য অ্যাক্সেসযোগ্য।]"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
