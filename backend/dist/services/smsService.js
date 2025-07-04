"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twilio_1 = __importDefault(require("twilio"));
class SMSService {
    constructor() {
        this.config = {
            accountSid: process.env.TWILIO_ACCOUNT_SID || '',
            authToken: process.env.TWILIO_AUTH_TOKEN || '',
            fromNumber: process.env.TWILIO_FROM_NUMBER || ''
        };
        if (this.config.accountSid && this.config.authToken) {
            this.client = (0, twilio_1.default)(this.config.accountSid, this.config.authToken);
        }
    }
    async sendSMS(to, message) {
        if (!this.client) {
            console.warn('SMS service not configured');
            return false;
        }
        try {
            await this.client.messages.create({
                body: message,
                from: this.config.fromNumber,
                to: to
            });
            return true;
        }
        catch (error) {
            console.error('SMS sending failed:', error);
            return false;
        }
    }
    async sendBulkSMS(recipients, message) {
        let success = 0;
        let failed = 0;
        for (const recipient of recipients) {
            const sent = await this.sendSMS(recipient, message);
            if (sent) {
                success++;
            }
            else {
                failed++;
            }
        }
        return { success, failed };
    }
}
exports.default = new SMSService();
