// frontend/src/pages/LandingPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();

    if (isLoading || isError || !settings) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    const heroStyle = { backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7)), url('${settings.heroSection?.backgroundImageUrl}')` };

    return (
        <div className="text-white">
            {/* Hero Section */}
            <section style={heroStyle} className="relative bg-cover bg-center py-48 px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
                <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-300">{settings.heroSection?.subtitle}</p>
                <Link to="/register" className="mt-10 inline-block bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400">
                    {settings.heroSection?.ctaText}
                </Link>
            </section>

            {/* Features Preview Section */}
            <section className="py-20 bg-slate-800">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-slate-400 max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {settings.featuresPage?.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="bg-slate-900/50 p-6 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-cyan-400 mb-4 mx-auto" />
                                <h3 className="text-xl font-bold">{feature.title}</h3>
                                <p className="mt-2 text-slate-400">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                    <Link to="/features" className="mt-12 inline-flex items-center gap-2 text-yellow-400 font-semibold hover:text-yellow-300">
                        See All Features <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* You can add more preview sections for About and Contact in a similar way */}

        </div>
    );
};

export default LandingPage;
