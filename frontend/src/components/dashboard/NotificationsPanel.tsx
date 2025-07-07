import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsPanel = () => {
  return (
    <button className="p-2 rounded-lg text-gray-600 hover:text-gray-800">
      <Bell size={18} />
    </button>
  );
};

export default NotificationsPanel;