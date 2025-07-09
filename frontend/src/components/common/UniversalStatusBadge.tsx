import React from 'react';
import { LucideIcon } from 'lucide-react';

interface UniversalStatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

const UniversalStatusBadge: React.FC<UniversalStatusBadgeProps> = ({
  status,
  variant = 'default',
  icon: Icon,
  size = 'md'
}) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-gray-100/90 text-gray-800',
      success: 'bg-green-100/90 text-green-800',
      warning: 'bg-yellow-100/90 text-yellow-800',
      error: 'bg-red-100/90 text-red-800',
      info: 'bg-blue-100/90 text-blue-800'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-xs',
      lg: 'px-4 py-2 text-sm'
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 10,
      md: 12,
      lg: 14
    };
    return iconSizes[size];
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold shadow-lg backdrop-blur-sm ${getVariantClasses()} ${getSizeClasses()}`}>
      {Icon && <Icon size={getIconSize()} />}
      {status}
    </span>
  );
};

export default UniversalStatusBadge;