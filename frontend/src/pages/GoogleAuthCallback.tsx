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
    const loginAction = useAuthStore((state) => state.login);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            loginAction(token);
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/login?error=Authentication failed. Please try again.', { replace: true });
        }
    }, [searchParams, loginAction, navigate]);

    return <FullScreenLoader />;
};

export default GoogleAuthCallback;
