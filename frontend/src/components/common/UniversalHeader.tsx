import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';

interface UniversalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  stats?: Array<{
    label: string;
    value: string | number;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  }>;
  actions?: React.ReactNode;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  stats = [],
  actions
}) => {
  const getStatColor = (color: string = 'blue') => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {Icon && <Icon size={32} className="text-brand-blue" />}
          <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
            {title}
          </span>
          <Sparkles size={28} className="text-brand-orange animate-pulse" />
        </h1>
        
        {(subtitle || stats.length > 0) && (
          <div className="flex items-center gap-4 mt-2">
            {subtitle && (
              <p className="text-text-secondary">{subtitle}</p>
            )}
            
            {stats.length > 0 && (
              <div className="flex items-center gap-2">
                {stats.map((stat, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${getStatColor(stat.color)}`}
                  >
                    {stat.label}: {stat.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default UniversalHeader;