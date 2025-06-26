// frontend/src/pages/PrivacyPolicyPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import Spinner from '../components/uikit/Spinner';
import Footer from '../components/layout/Footer';
import PublicHeader from '../components/layout/PublicHeader';

const PrivacyPolicyPage = () => {
    const { isLoading: isLoadingSettings, isError: isErrorSettings } = useSiteSettings();
    const [content, setContent] = useState('');
    const [isContentLoading, setIsContentLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await apiClient.get('/legal/privacy-policy');
                setContent(res.data.content);
            } catch (error) {
                console.error("Failed to load privacy policy", error);
                setContent('<p>Could not load the privacy policy at this time. Please try again later.</p>');
            } finally {
                setIsContentLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    if (isLoadingSettings || isContentLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-light-bg dark:bg-dark-bg">
                <Spinner />
            </div>
        );
    }

    if (isErrorSettings) {
        return <div className="text-center p-8 text-red-500">Error loading page configuration. Please try again later.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg">
            <PublicHeader />

            <main className="container mx-auto px-6 py-16">
                <div className="bg-light-card max-w-4xl mx-auto p-8 md:p-12 rounded-xl border border-border-color shadow-sm dark:bg-dark-card dark:border-border-color-dark">
                    <h1 className="text-4xl font-extrabold mb-6 text-dark-text dark:text-dark-text-dark">Privacy Policy</h1>
                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-brand-primary hover:prose-a:opacity-80 dark:text-light-text-dark"
                        dangerouslySetInnerHTML={{ __html: content }}>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
