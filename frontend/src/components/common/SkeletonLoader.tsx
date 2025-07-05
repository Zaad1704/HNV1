import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-app-border rounded';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'rectangular':
        return { width: '100%', height: '200px' };
      case 'text':
      default:
        return { width: '100%', height: '16px' };
    }
  };

  const defaultSize = getDefaultSize();
  const style = {
    width: width || defaultSize.width,
    height: height || defaultSize.height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${index < lines - 1 ? 'mb-2' : ''}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton components
export const SkeletonCard: React.FC = () => (
  <div className="app-surface rounded-3xl p-6 border border-app-border">
    <div className="flex items-center gap-4 mb-4">
      <SkeletonLoader variant="circular" width={48} height={48} />
      <div className="flex-1">
        <SkeletonLoader width="60%" height={20} className="mb-2" />
        <SkeletonLoader width="40%" height={16} />
      </div>
    </div>
    <SkeletonLoader variant="text" lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="app-surface rounded-3xl border border-app-border overflow-hidden">
    <div className="p-4 border-b border-app-border">
      <SkeletonLoader width="30%" height={24} />
    </div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="p-4 border-b border-app-border last:border-b-0 flex items-center gap-4">
        <SkeletonLoader variant="circular" width={32} height={32} />
        <div className="flex-1 grid grid-cols-4 gap-4">
          <SkeletonLoader height={16} />
          <SkeletonLoader height={16} />
          <SkeletonLoader height={16} />
          <SkeletonLoader width="60%" height={16} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="app-surface rounded-3xl p-6 border border-app-border">
        <div className="flex items-center justify-between mb-4">
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader variant="circular" width={40} height={40} />
        </div>
        <SkeletonLoader width="80%" height={32} className="mb-2" />
        <SkeletonLoader width="40%" height={14} />
      </div>
    ))}
  </div>
);

export default SkeletonLoader;