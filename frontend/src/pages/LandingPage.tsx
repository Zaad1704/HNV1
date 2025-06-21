import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useWindowSize } from '../hooks/useWindowSize'; // Keep this hook
import DesktopLandingLayout from '../components/layout/DesktopLandingLayout'; // New import
import MobileLandingLayout from '../components/layout/MobileLandingLayout'; // New import

// Helper for loading state (keep as is)
const FullPageLoader = () => <div className="min-h-screen bg-brand-primary flex items-center justify-center text-white">Loading...</div>;

const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [plans, setPlans] = useState<any[]>([]);
    const { width } = useWindowSize(); // Use the hook to determine screen width

    useEffect(() => {
        apiClient.get('/plans').then(res => {
            setPlans(res.data.data.filter(p => p.isPublic));
        }).catch(err => console.error("Failed to fetch plans", err));
    }, []);

    if (isLoading || isError || !settings) {
        return <FullPageLoader />;
    }

    // Conditional rendering based on screen width
    if (width < 768) { // Assuming 768px (md breakpoint) is your cutoff for mobile
        return <MobileLandingLayout settings={settings} plans={plans} />;
    } else {
        return <DesktopLandingLayout settings={settings} plans={plans} />;
    }
};

export default LandingPage;
