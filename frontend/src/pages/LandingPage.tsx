import React, { useState, useEffect, Suspense } from 'react';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useWindowSize } from '../hooks/useWindowSize';
import DesktopLandingLayout from '../components/layout/DesktopLandingLayout';
import MobileLandingLayout from '../components/layout/MobileLandingLayout';

// A simple loader for when the page is fetching initial data
const FullPageLoader = () => (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center text-dark-text">
        <p>Loading HNV Property Management Solutions...</p>
    </div>
);

const LandingPage = () => {
    // Fetch site settings and public plans which are used across the landing page
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [plans, setPlans] = useState<any[]>([]);
    const { width } = useWindowSize(); // Hook to get window width for responsiveness

    useEffect(() => {
        // Fetch only the publicly visible plans for the pricing section
        apiClient.get('/plans')
            .then(res => {
                const publicPlans = res.data.data.filter((p: any) => p.isPublic);
                setPlans(publicPlans);
            })
            .catch(err => console.error("Failed to fetch plans", err));
    }, []);

    // Show a loader while fetching essential data
    if (isLoading || isError || !settings) {
        return <FullPageLoader />;
    }

    // Conditionally render the correct layout based on screen width
    return (
        <Suspense fallback={<FullPageLoader />}>
            {width < 768 ? (
                <MobileLandingLayout settings={settings} plans={plans} />
            ) : (
                <DesktopLandingLayout settings={settings} plans={plans} />
            )}
        </Suspense>
    );
};

export default LandingPage;
