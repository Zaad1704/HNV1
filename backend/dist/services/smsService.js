"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SmsService {
    constructor() {
    }
    async sendSms(to, message) {
        try {
            if (!process.env.TWILIO_PHONE_NUMBER) {
                console.warn('SMS Service: TWILIO_PHONE_NUMBER is not set. Skipping sending SMS.');
                return;
            }
            console.log(`SMS Service: (MOCK) Sent SMS to ${to}: "${message.substring(0, 50)}..."`);
        }
        catch (error) {
            console.error('SMS Service: Failed to send SMS:', error);
            throw new Error('Failed to send SMS.');
        }
    }
    async sendSmsWithLink(to, message, linkUrl) {
        const fullMessage = `${message}\n${linkUrl}`;
        return this.sendSms(to, fullMessage);
    }
}
exports.default = new SmsService();
