import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
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

    // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt immediately for better visibility
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.log('Install prompt failed:', error);
      }
    }
  };

  const getInstallInstructions = () => {
    switch (deviceType) {
      case 'android':
        return {
          icon: <Smartphone className="w-6 h-6" />,
          title: t('install_app.install_android'),
          steps: [
            t('install_app.android_step1'),
            t('install_app.android_step2'),
            t('install_app.android_step3')
          ]
        };
      case 'ios':
        return {
          icon: <Apple className="w-6 h-6" />,
          title: t('install_app.add_to_home'),
          steps: [
            t('install_app.ios_step1'),
            t('install_app.ios_step2'),
            t('install_app.ios_step3')
          ]
        };
      case 'desktop':
        return {
          icon: <Monitor className="w-6 h-6" />,
          title: t('install_app.install_desktop'),
          steps: [
            t('install_app.desktop_step1'),
            t('install_app.desktop_step2'),
            t('install_app.desktop_step3')
          ]
        };
      default:
        return {
          icon: <Download className="w-6 h-6" />,
          title: t('install_app.title'),
          steps: [
            t('install_app.generic_step1'),
            t('install_app.generic_step2'),
            t('install_app.generic_step3')
          ]
        };
    }
  };

  if (isInstalled || !showPrompt) return null;

  const instructions = getInstallInstructions();

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="app-surface rounded-2xl p-4 border border-app-border shadow-app-xl backdrop-blur-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {instructions.icon}
            <h3 className="font-semibold text-text-primary">{instructions.title}</h3>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          {t('install_app.description')}
        </p>

        {deferredPrompt ? (
          <div className="space-y-3">
            <button
              onClick={handleInstall}
              className="w-full btn-gradient py-3 px-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              📱 {t('install_app.install_button')}
            </button>
            <p className="text-xs text-center text-text-muted">
              {t('install_app.features')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
            <div className="text-center pt-2 border-t border-app-border">
              <p className="text-xs text-text-muted">
                {t('install_app.best_experience')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;