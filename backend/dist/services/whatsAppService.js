"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class WhatsAppService {
}
constructor();
{
    this.config = {};
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
        accessToken;
    process.env.WHATSAPP_ACCESS_TOKEN || '',
        phoneNumberId;
    process.env.WHATSAPP_PHONE_NUMBER_ID || '';
}
;
async;
sendMessage(to, string, message, string);
Promise < boolean > { : .config.accessToken || !this.config.phoneNumberId };
{ }
console.warn('WhatsApp service not configured');
return false;
try {
    await axios_1.default.post();
}
finally {
}
`${this.config.apiUrl}/${this.config.phoneNumberId}/messages
  headers: { 
            'Authorization': `;
Bearer;
$;
{
    this.config.accessToken;
}
exports.default = new WhatsAppService();
