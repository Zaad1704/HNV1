import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang, languages } from '../../contexts/LanguageContext';

const LocalLanguageToggle = () => {
  const { lang, detectedLang, toggleLanguage } = useLang();
  const { t } = useTranslation();

  // Only show toggle if detected language is different from English
  if (detectedLang === 'en' || detectedLang === lang) {
    return null;
  }

  const currentLang = languages.find(l => l.code === lang) || languages[0];
  const targetLang = languages.find(l => l.code === (lang === 'en' ? detectedLang : 'en')) || languages[0];

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-app-surface border border-app-border text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
      aria-label={t('common.toggle_language')}
      title={`${t('common.switch_to')} ${targetLang.nativeName}`}
    >
      <Languages size={16} />
      <span className="text-sm font-medium">
        {currentLang.flag} → {targetLang.flag}
      </span>
      <span className="hidden sm:inline text-xs text-text-muted">
        {targetLang.nativeName}
      </span>
    </button>
  );
};

export default LocalLanguageToggle;