import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import NotificationsPanel from '../dashboard/NotificationsPanel';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  showNotifications?: boolean;
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  onMenuToggle, 
  showNotifications = false,
  title
}) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-app-surface/95 backdrop-blur-md border-b border-app-border z-[100] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-text-primary">{title || t('nav.dashboard')}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors">
          <Search size={20} />
        </button>
        
        {showNotifications && <NotificationsPanel />}
        
        <div className="w-8 h-8 app-gradient rounded-full flex items-center justify-center font-semibold text-white text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;