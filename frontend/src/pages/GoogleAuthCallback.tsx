import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const FullScreenLoader = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-lg">Finalizing login...</div>
    </div>
);

const GoogleAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // FIX: Use `setToken` instead of the full `login` action.
    const setToken = useAuthStore((state) => state.setToken);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Just store the token. The main App component's useEffect will handle fetching user details.
            // This is a more robust pattern for OAuth flows.
            setToken(token);
            navigate('/dashboard', { replace: true });
        } else {
            // Handle the case where the token is missing from the redirect
            navigate('/login?error=Authentication failed. Please try again.', { replace: true });
        }
    }, [searchParams, setToken, navigate]);

    return <FullScreenLoader />;
};

export default GoogleAuthCallback;
