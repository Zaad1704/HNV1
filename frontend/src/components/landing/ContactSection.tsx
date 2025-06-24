// frontend/src/components/landing/ContactSection.tsx
import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const ContactSection = () => {
    const { data: settings } = useSiteSettings();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ submitting: false, success: false, error: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ submitting: true, success: false, error: '' });
        try {
            await apiClient.post('/feedback', formData);
            setStatus({ submitting: false, success: true, error: '' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err: any) {
            setStatus({ submitting: false, success: false, error: err.response?.data?.message || 'Failed to send message.' });
        }
    };

    return (
        <>
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.contactPage?.title}</h2>
                <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings?.contactPage?.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
                <div className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark">
                    <h3 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-6">{settings?.contactPage?.formTitle}</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Form fields with updated styling */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-light-text">Full Name</label> {/* Added htmlFor */}
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-light-text">Email Address</label> {/* Added htmlFor */}
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-light-text">Subject</label> {/* Added htmlFor */}
                            <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-light-text">Message</label> {/* Added htmlFor */}
                            <textarea name="message" id="message" value={formData.message} onChange={handleChange} required rows={5} className="mt-1 w-full p-3 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-lg"></textarea>
                        </div>
                        <button type="submit" disabled={status.submitting} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {status.submitting ? 'Sending...' : 'Send Message'}
                        </button>
                        {status.success && <p className="text-success">Message sent successfully!</p>}
                        {status.error && <p className="text-danger">{status.error}</p>}
                    </form>
                </div>
                <div className="space-y-8 text-light-text">
                    {settings?.contactPage?.addresses?.map((addr, index) => (
                        <div key={index}>
                            <h4 className="text-xl font-bold text-primary">{addr.locationName}</h4>
                            <p className="mt-2 text-dark-text dark:text-light-text-dark">{addr.fullAddress}</p>
                            <p>Phone: {addr.phone}</p>
                            <p>Email: {addr.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ContactSection;
