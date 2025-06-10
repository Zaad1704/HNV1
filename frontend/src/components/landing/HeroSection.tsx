import React from "react";
import Trans from "../Trans";
export default function HeroSection() {
  return (
    <section className="hero-bg text-white py-20 md:py-32" style={{backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url('https://placehold.co/1600x900/6366F1/FFFFFF?text=Modern+Apartments')", backgroundSize: "cover", backgroundPosition: "center"}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <Trans en="Streamline Your Property Management" bn="[আপনার সম্পত্তি পরিচালনা সহজ করুন]" />
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
          <Trans
            en="Efficiently manage tenants, properties, and finances with ProManage Solutions. Your all-in-one platform for seamless operations."
            bn="[ProManage Solutions এর সাথে ভাড়াটে, সম্পত্তি এবং অর্থ দক্ষতার সাথে পরিচালনা করুন। আপনার সমন্বিত প্ল্যাটফর্ম।]"
          />
        </p>
        <a href="#services" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
          <Trans en="Discover Our Services" bn="[আমাদের পরিষেবাগুলি আবিষ্কার করুন]" />
        </a>
      </div>
    </section>
  );
}
