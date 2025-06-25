// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

// Import all the section components
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import ContactSection from '../components/landing/ContactSection';
import LeadershipSection from '../components/landing/LeadershipSection';

const LandingPage = () => {

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: "easeOut",
          },
        }),
    };

    const sections = [
        { id: 'about', title: 'About HNV', description: 'Learn about our mission and vision.', gradient: 'primary-card-gradient' },
        { id: 'services', title: 'Our Services', description: 'Discover our comprehensive features.', gradient: 'secondary-card-gradient' },
        { id: 'pricing', title: 'Pricing Plans', description: 'Find the perfect plan for your business.', gradient: 'primary-card-gradient' },
        { id: 'leadership', title: 'Our Team', description: 'Meet the experts behind our platform.', gradient: 'secondary-card-gradient' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
        >
            {/* Main Hero Section with Cards */}
            <section className="py-24 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-dark-text dark:text-dark-text-dark mb-4">
                        The All-in-One Platform for
                    </h1>
                    <h2 className="text-5xl md:text-6xl font-extrabold gradient-text mb-8">
                        Modern Property Management
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-light-text dark:text-light-text-dark">
                        Automate tasks, track finances, and manage tenants with ease. Our platform provides the tools you need to scale your business efficiently.
                    </p>
                </div>

                <div className="container mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section, index) => (
                         <ScrollLink
                            key={section.id}
                            to={section.id}
                            spy={true}
                            smooth={true}
                            offset={-70}
                            duration={500}
                            className="cursor-pointer"
                        >
                            <motion.div
                                className={`card bg-gradient-to-br from-brand-primary to-brand-secondary text-white p-8 rounded-3xl shadow-lg flex flex-col justify-between h-full`}
                                variants={cardVariants}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                            >
                                <div>
                                    <h3 className="text-3xl font-bold">{section.title}</h3>
                                    <p className="mt-2 opacity-80">{section.description}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-end">
                                    <span className="font-semibold">Explore</span>
                                    <ArrowRight className="ml-2"/>
                                </div>
                            </motion.div>
                        </ScrollLink>
                    ))}
                     <motion.div 
                        className="card neutral-glass p-8 rounded-3xl"
                        variants={cardVariants}
                        custom={sections.length}
                        initial="hidden"
                        animate="visible"
                    >
                         <h3 className="text-3xl font-bold text-dark-text">Login</h3>
                         <p className="mt-2 text-light-text">Already have an account? Access your dashboard here.</p>
                         <a href="/login" className="btn-dark font-semibold py-3 px-6 rounded-lg mt-6 self-start text-sm inline-flex items-center gap-2">
                            <LogIn size={18} /> Go to Login
                         </a>
                     </motion.div>
                     <motion.div 
                        className="card neutral-glass p-8 rounded-3xl"
                        variants={cardVariants}
                        custom={sections.length + 1}
                        initial="hidden"
                        animate="visible"
                     >
                         <h3 className="text-3xl font-bold text-dark-text">Sign Up</h3>
                         <p className="mt-2 text-light-text">Join our platform and start your free trial today.</p>
                         <a href="/register" className="btn-light font-bold py-3 px-6 rounded-lg mt-6 self-start text-sm inline-flex items-center gap-2">
                             <UserPlus size={18}/> Create Account
                         </a>
                     </motion.div>
                </div>
            </section>

            {/* Content Sections */}
            <div id="about" className="py-24 bg-light-card dark:bg-dark-card"><AboutSection /></div>
            <div id="services" className="py-24 bg-light-bg dark:bg-dark-bg"><ServicesSection /></div>
            <div id="pricing" className="py-24 bg-light-card dark:bg-dark-card"><PricingSection /></div>
            <div id="leadership" className="py-24 bg-light-bg dark:bg-dark-bg"><LeadershipSection /></div>
            <div id="contact" className="py-24 bg-light-card dark:bg-dark-card"><ContactSection /></div>
        </motion.div>
    );
};

export default LandingPage;
