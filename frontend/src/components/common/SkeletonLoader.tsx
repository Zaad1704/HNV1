import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'table' | 'header';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 3 }) => {
  const CardSkeleton = () => (
    <div className="app-surface rounded-3xl p-6 border border-app-border animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-8 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 app-surface rounded-xl animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const HeaderSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded-full w-16"></div>
        ))}
      </div>
    </div>
  );

  if (type === 'header') return <HeaderSkeleton />;
  if (type === 'list') return <ListSkeleton />;
  
  return (
    <div className="universal-grid universal-grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="app-surface rounded-3xl p-6 border border-app-border animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;