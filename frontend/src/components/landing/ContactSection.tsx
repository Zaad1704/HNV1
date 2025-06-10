import React from "react";
import Trans from "../Trans";

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-indigo-700 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <Trans en="Get In Touch" bn="[যোগাযোগ করুন]" />
          </h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            <Trans
              en="We're here to help. Contact us for inquiries, support, or to learn more about our solutions."
              bn="[আমরা সাহায্য করতে এখানে আছি। অনুসন্ধান, সমর্থন বা আমাদের সমাধান সম্পর্কে আরও জানতে আমাদের সাথে যোগাযোগ করুন।]"
            />
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Contact Information */}
          <div className="space-y-6 bg-indigo-600 p-8 rounded-lg shadow-xl">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 text-indigo-300"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <Trans en="Our Office" bn="[আমাদের অফিস]" />
              </h3>
              <p className="text-indigo-100">123 Property Lane, Suite 400<br />Management City, MC 54321</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 text-indigo-300"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <Trans en="Phone Support" bn="[ফোন সমর্থন]" />
              </h3>
              <p className="text-indigo-100">
                <Trans
                  en={<>General: (555) 123-4567<br />Support: (555) 765-4321</>}
                  bn={<>সাধারণ: (৫৫৫) ১২৩-৪৫৬৭<br />সমর্থন: (৫৫৫) ৭৬৫-৪৩২১</>}
                />
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 text-indigo-300"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <Trans en="Email Us" bn="[আমাদের ইমেইল করুন]" />
              </h3>
              <p className="text-indigo-100">info@promanagesolutions.com<br />support@promanagesolutions.com</p>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">
                <Trans en="Find Us Here" bn="[আমাদের এখানে খুঁজুন]" />
              </h3>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0.0!2d0.0!3d0.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDU0JzM3LjAiTiAxMDPCsDIyJzAzLjAiRQ!5e0!3m2!1sen!2sus!4v1620300000000!5m2!1sen!2sus"
                  width="100%"
                  height={250}
                  style={{ border: 0, borderRadius: "0.5rem" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Placeholder"
                />
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-xl text-gray-800">
            <h3 className="text-2xl font-semibold mb-6 text-indigo-700">
              <Trans en="Send Us a Message" bn="[আমাদের একটি বার্তা পাঠান]" />
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Trans en="Full Name" bn="[পুরো নাম]" />
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Trans en="Email Address" bn="[ইমেইল ঠিকানা]" />
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Trans en="Subject" bn="[বিষয়]" />
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  placeholder="Inquiry about..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Trans en="Message" bn="[বার্তা]" />
                </label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  placeholder="Your message..."
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Trans en="Send Message" bn="[বার্তা পাঠান]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
