// frontend/src/pages/GoogleAuthCallback.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Finalizing login...</div>
    </div>
);

const GoogleAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // FIX: Get all necessary actions from the auth store
    const { setToken, setUser, logout } = useAuthStore();

    useEffect(() => {
        const handleAuthentication = async () => {
            const token = searchParams.get('token');
            if (token) {
                // 1. Set the token so the next API call is authenticated
                setToken(token);
                try {
                    // 2. Fetch the user's data from the backend
                    const response = await apiClient.get('/auth/me');
                    // 3. Set the user object in the global state
                    setUser(response.data.data);
                    // 4. Now that state is complete, navigate to the dashboard
                    navigate('/dashboard', { replace: true });
                } catch (error) {
                    console.error("Failed to fetch user after Google authentication.", error);
                    logout(); // Clean up on failure
                    navigate('/login?error=Authentication+failed', { replace: true });
                }
            } else {
                navigate('/login?error=Google+authentication+failed', { replace: true });
            }
        };

        handleAuthentication();
    // Depend on all used functions to satisfy the linter
    }, [searchParams, navigate, setToken, setUser, logout]);

    return <FullScreenLoader />;
};

export default GoogleAuthCallback;
