import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'table' | 'text' | 'avatar' | 'custom';
  count?: number;
  className?: string;
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 1, 
  className = '',
  height,
  width 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`app-surface rounded-3xl p-6 border border-app-border ${className}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`${baseClasses} w-12 h-12 rounded-2xl`} />
              <div className="flex-1">
                <div className={`${baseClasses} h-4 w-3/4 mb-2`} />
                <div className={`${baseClasses} h-3 w-1/2`} />
              </div>
            </div>
            <div className="space-y-3">
              <div className={`${baseClasses} h-3 w-full`} />
              <div className={`${baseClasses} h-3 w-5/6`} />
              <div className={`${baseClasses} h-3 w-4/6`} />
            </div>
            <div className="flex gap-3 mt-6">
              <div className={`${baseClasses} h-10 w-24 rounded-xl`} />
              <div className={`${baseClasses} h-10 w-20 rounded-xl`} />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 app-surface rounded-2xl border border-app-border">
                <div className={`${baseClasses} w-10 h-10 rounded-full`} />
                <div className="flex-1">
                  <div className={`${baseClasses} h-4 w-3/4 mb-2`} />
                  <div className={`${baseClasses} h-3 w-1/2`} />
                </div>
                <div className={`${baseClasses} h-8 w-16 rounded-lg`} />
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className={`app-surface rounded-2xl border border-app-border overflow-hidden ${className}`}>
            <div className="p-4 border-b border-app-border">
              <div className={`${baseClasses} h-6 w-48`} />
            </div>
            <div className="divide-y divide-app-border">
              {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className={`${baseClasses} w-8 h-8 rounded-full`} />
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div className={`${baseClasses} h-4`} />
                    <div className={`${baseClasses} h-4`} />
                    <div className={`${baseClasses} h-4`} />
                    <div className={`${baseClasses} h-4 w-3/4`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className={`${baseClasses} h-4 ${
                index === count - 1 ? 'w-3/4' : 'w-full'
              }`} />
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div className={`${baseClasses} ${width || 'w-10'} ${height || 'h-10'} rounded-full ${className}`} />
        );

      case 'custom':
        return (
          <div className={`${baseClasses} ${height || 'h-4'} ${width || 'w-full'} ${className}`} />
        );

      default:
        return (
          <div className={`${baseClasses} h-4 w-full ${className}`} />
        );
    }
  };

  return (
    <>
      {Array.from({ length: type === 'list' || type === 'table' ? 1 : count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;