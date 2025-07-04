"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivacyPolicy = exports.getTermsOfService = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const marked_1 = require("marked");
// Get Terms of Service
exports.getTermsOfService = (0, express_async_handler_1.default)(async (req, res) => {
    const termsMarkdown = 
  
    const privacyMarkdown = 
  