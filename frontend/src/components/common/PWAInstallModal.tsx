import React from 'react';
import { X, Download, Smartphone, Monitor, Tablet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  canDirectInstall: boolean;
  onInstall: () => void;
  instructions: {
    title: string;
    steps: string[];
  };
}

const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  platform,
  canDirectInstall,
  onInstall,
  instructions
}) => {
  const { t } = useTranslation();

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios': return <Tablet size={48} className="text-brand-blue" />;
      case 'android': return <Smartphone size={48} className="text-brand-orange" />;
      case 'desktop': return <Monitor size={48} className="text-brand-blue" />;
      default: return <Download size={48} className="text-brand-orange" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="app-surface rounded-3xl shadow-app-xl w-full max-w-md border border-app-border"
          >
            <div className="flex justify-between items-center p-6 border-b border-app-border">
              <h2 className="text-xl font-bold text-text-primary">Install HNV App</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-app-bg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mb-6">
                {getPlatformIcon()}
              </div>
              
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {instructions.title}
              </h3>

              {canDirectInstall ? (
                <div className="space-y-4">
                  <p className="text-text-secondary">
                    Install HNV as a native app for the best experience
                  </p>
                  <button
                    onClick={onInstall}
                    className="w-full btn-gradient py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Install Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-text-secondary mb-4">
                    Follow these steps to install:
                  </p>
                  <div className="text-left space-y-3">
                    {instructions.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-text-secondary text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-app-bg rounded-2xl">
                <p className="text-xs text-text-muted">
                  Installing the app gives you faster access, offline capabilities, and native notifications.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallModal;