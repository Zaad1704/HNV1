class TranslationService {
  private translations: Record<string, Record<string, string>> = {};

  async loadTranslations(language: string): Promise<Record<string, string>> {
    try {
      if (this.translations[language]) {
        return this.translations[language];
      }
      const translations = await this.fetchTranslations(language);
      this.translations[language] = translations;
      return translations;
    } catch (error) {
      console.error('Translation loading error:', error);
      return {};
    }
  }

  private async fetchTranslations(language: string): Promise<Record<string, string>> {
    return {
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit'
    };
  }

  translate(key: string, language: string, params?: Record<string, any>): string {
    const translations = this.translations[language] || {};
    let translation = translations[key] || key;

    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  }
}

export default new TranslationService();