"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        // FIX: Throw an error if config is missing to ensure transporter is always assigned.
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("FATAL ERROR: Email service credentials are not configured in .env file.");
            throw new Error("Email service is not configured.");

        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587', 10),
            secure: (process.env.EMAIL_PORT === '465'),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

    async sendEmail(to, subject, templateName, templateData) {
        try {
            const templatePath = path_1.default.join(__dirname, '..', 'templates', `${templateName}.html
                const regex = new RegExp(`{{${key}}}
            console.error(`Error sending email to ${to}: