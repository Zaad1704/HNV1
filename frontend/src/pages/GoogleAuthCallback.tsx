// frontend/src/pages/GoogleAuthCallback.tsx

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
    // THE FIX: Get the 'setToken' action from the store
    const setToken = useAuthStore((state) => state.setToken);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // THE FIX: Use the 'setToken' action, as we only have the token here.
            setToken(token);
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/login?error=Authentication failed. Please try again.', { replace: true });
        }
    }, [searchParams, setToken, navigate]); // Update dependencies

    return <FullScreenLoader />;
};

export default GoogleAuthCallback;
