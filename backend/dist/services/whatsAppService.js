"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WhatsAppService {
    constructor() {
    }
    async sendMessage(to, message) {
        try {
            if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
                console.warn('WhatsApp Service: WHATSAPP_PHONE_NUMBER_ID is not set. Skipping sending WhatsApp message.');
                return;
            }
            console.log(`WhatsApp Service: (MOCK) Sent WhatsApp message to ${to}: "${message.substring(0, 50)}..."`);
        }
        catch (error) {
            console.error('WhatsApp Service: Failed to send WhatsApp message:', error);
            throw new Error('Failed to send WhatsApp message.');
        }
    }
    async sendDocument(to, message, documentUrl) {
        const fullMessage = `${message}\nDocument: ${documentUrl}`;
        return this.sendMessage(to, fullMessage);
    }
}
exports.default = new WhatsAppService();
