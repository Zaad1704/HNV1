import twilio from 'twilio';

interface SMSConfig { accountSid: string;
  authToken: string;

  fromNumber: string; }


class SMSService { private client: any;

  private config: SMSConfig; }


  constructor() { this.config = { }
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || ''

    };

    if (this.config.accountSid && this.config.authToken) { this.client = twilio(this.config.accountSid, this.config.authToken); }




  async sendSMS(to: string, message: string): Promise<boolean> { if (!this.client) { }
      console.warn('SMS service not configured');
      return false;



    try { await this.client.messages.create({ }
        body: message,
        from: this.config.fromNumber,
        to: to;

      });
      return true;
    } catch (error) { console.error('SMS sending failed:', error);
      return false; }



  async sendBulkSMS(recipients: string[], message: string): Promise<{ success: number; failed: number }> { let success = 0;
    let failed = 0;

    for (const recipient of recipients) { }
      const sent = await this.sendSMS(recipient, message);
      if (sent) { success++; }


      } else { failed++; }



    return { success, failed };


export default new SMSService();