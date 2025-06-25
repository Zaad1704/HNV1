import React from "react";
import { useAuthStore } from "../store/authStore";

interface RoleGuardProps {
  allowed: string[]; // e.g., ["SuperAdmin", "Landlord"]
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowed, children, fallback = null }) => {
  const user = useAuthStore((s) => s.user);
  if (!user || !allowed.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
};

export default RoleGuard;
