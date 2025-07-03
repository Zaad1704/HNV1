import React, { useState } from 'react';
import { X } from 'lucide-react';
import RoleSelector from './RoleSelector';
import apiClient from '../../api/client';

interface GoogleRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignup?: boolean;
}

const GoogleRoleModal: React.FC<GoogleRoleModalProps> = ({ isOpen, onClose, isSignup = false }) => {
  const [selectedRole, setSelectedRole] = useState('Landlord');

  const handleGoogleAuth = () => {
    const baseURL = apiClient.defaults.baseURL;
    const params = isSignup ? `?signup=true&role=${selectedRole}` : `?role=${selectedRole}`;
    window.location.href = `${baseURL}/auth/google${params}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-surface rounded-2xl w-full max-w-md border border-app-border shadow-app-lg">
        <div className="p-6 border-b border-app-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            {isSignup ? 'Choose Your Role' : 'Select Role for Login'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-text-secondary mb-6">
            Please select your role to continue with Google {isSignup ? 'signup' : 'login'}.
          </p>
          
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            className="mb-6"
          />
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-app-border rounded-xl hover:bg-app-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGoogleAuth}
              className="flex-1 px-4 py-3 btn-gradient rounded-xl"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleRoleModal;