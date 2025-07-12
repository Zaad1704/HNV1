import React from 'react';
import { User } from 'lucide-react';

interface TenantAvatarProps {
  tenant?: {
    name: string;
    tenantImage?: string;
    imageUrl?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TenantAvatar: React.FC<TenantAvatarProps> = ({ 
  tenant, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm'
  };

  const imageUrl = tenant?.tenantImage || tenant?.imageUrl;
  const hasImage = imageUrl && imageUrl.trim() !== '';

  if (!tenant) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center ${className}`}>
        <User size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} className="text-gray-600" />
      </div>
    );
  }

  if (hasImage) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img
          src={imageUrl.startsWith('/') ? `${window.location.origin}${imageUrl}` : imageUrl}
          alt={tenant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  ${tenant.name.charAt(0).toUpperCase()}
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold ${className}`}>
      {tenant.name.charAt(0).toUpperCase()}
    </div>
  );
};

export default TenantAvatar;