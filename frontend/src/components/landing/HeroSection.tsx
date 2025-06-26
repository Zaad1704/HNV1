// frontend/src/components/landing/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IHeroSection } from '../../types/siteSettings'; // Assuming type exists

const HeroSection: React.FC<{ settings?: IHeroSection }> = ({ settings }) => {
    return (
        <section id="hero" className="relative text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-orange-500 dark:from-blue-800 dark:to-orange-700"></div>
            <div className="relative container mx-auto px-6 py-24 md:py-32 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                    {settings?.title || "Manage Properties with Ease"}
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 mb-8">
                    {settings?.subtitle || "The all-in-one solution for landlords, agents, and property managers."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/register" className="px-8 py-3 bg-white text-brand-primary font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105">
                        Get Started for Free
                    </Link>
                    <a href="#features" className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/20 transition-all">
                        Learn More
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
