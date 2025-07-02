import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Apple } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/windows|macintosh|linux/.test(userAgent)) {
      setDeviceType('desktop');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after 30 seconds if no native prompt
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const getInstallInstructions = () => {
    switch (deviceType) {
      case 'android':
        return {
          icon: <Smartphone className="w-6 h-6" />,
          title: 'Install HNV App',
          steps: [
            'Tap the menu (⋮) in your browser',
            'Select "Add to Home screen" or "Install app"',
            'Tap "Add" or "Install"'
          ]
        };
      case 'ios':
        return {
          icon: <Apple className="w-6 h-6" />,
          title: 'Add to Home Screen',
          steps: [
            'Tap the Share button (□↗) in Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" in the top right corner'
          ]
        };
      case 'desktop':
        return {
          icon: <Monitor className="w-6 h-6" />,
          title: 'Install Desktop App',
          steps: [
            'Look for the install icon (⊕) in your address bar',
            'Click it and select "Install"',
            'Or use browser menu → "Install HNV Property Management"'
          ]
        };
      default:
        return {
          icon: <Download className="w-6 h-6" />,
          title: 'Install App',
          steps: [
            'Look for install options in your browser menu',
            'Add to home screen or install as app',
            'Enjoy the native app experience'
          ]
        };
    }
  };

  if (isInstalled || !showPrompt) return null;

  const instructions = getInstallInstructions();

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="app-surface rounded-2xl p-4 border border-app-border shadow-app-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {instructions.icon}
            <h3 className="font-semibold text-text-primary">{instructions.title}</h3>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-text-muted hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-3">
          Get the full app experience with offline access and notifications.
        </p>

        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full btn-gradient py-2 px-4 rounded-xl text-sm font-medium"
          >
            Install Now
          </button>
        ) : (
          <div className="space-y-2">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="w-4 h-4 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;