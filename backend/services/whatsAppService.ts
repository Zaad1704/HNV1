import axios from 'axios';

interface WhatsAppConfig {
  apiUrl: string;
  accessToken: string;
  phoneNumberId: string;
}

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    };
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.config.accessToken || !this.config.phoneNumberId) {
      console.warn('WhatsApp service not configured');
      return false;
    }

    try {
      await axios.post(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return true;
    } catch (error) {
      console.error('WhatsApp message failed:', error);
      return false;
    }
  }
}

export default new WhatsAppService();