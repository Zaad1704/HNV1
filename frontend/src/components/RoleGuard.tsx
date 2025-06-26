import React from 'react';
import { useAuthStore } from '../store/authStore';

interface RoleGuardProps {
  allowed: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowed, children }) => {
  const { user } = useAuthStore();
  
  if (!user || !allowed.includes(user.role)) {
    return null;
  }
  
  return <>{children}</>;
};

export default RoleGuard;