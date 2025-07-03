// backend/services/smsService.ts

// This is a placeholder for your SMS integration service.
// You would integrate with a third-party SMS provider like Twilio, Nexmo, Vonage here.

class SmsService {
  constructor() {
    // Initialize your SMS provider's SDK here
    // Example for Twilio:
    // this.twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  /**
   * Sends an SMS message to a given phone number.
   * @param to The recipient's phone number.
   * @param message The text message to send.
   * @returns A promise that resolves when the message is sent.
   */
  async sendSms(to: string, message: string): Promise<void> {
    try {
      if (!process.env.TWILIO_PHONE_NUMBER) {
        console.warn('SMS Service: TWILIO_PHONE_NUMBER is not set. Skipping sending SMS.');
        return;
      }
      // Example for Twilio:
      // await this.twilioClient.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: to,
      // });
      Sent SMS to ${to}: "${message.substring(0, 50)}..."`);
    } catch (error) {
      console.error('SMS Service: Failed to send SMS:', error);
      throw new Error('Failed to send SMS.');
    }
  }

  /**
   * Placeholder for sending an SMS with a link (e.g., to a PDF receipt).
   * @param to The recipient's phone number.
   * @param message The text message to send.
   * @param linkUrl A URL to include in the message.
   */
  async sendSmsWithLink(to: string, message: string, linkUrl: string): Promise<void> {
    const fullMessage = `${message}\n${linkUrl}`;
    return this.sendSms(to, fullMessage);
  }
}

export default new SmsService();
