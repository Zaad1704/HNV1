"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const pdfkit_1 = __importDefault(require("pdfkit"));
const { Parser } = require('json2csv');
const router = (0, express_1.Router)();
// Monthly collection sheet endpoint
router.get('/monthly-collection', authMiddleware_1.protect, async (req, res) => {
    try {
        const { month, year } = req.query;
        // Mock data - replace with actual database query
        const collectionData = [
            {
                _id: '1',
                tenantName: 'John Doe',
                unitNo: 'A101',
                rentAmount: 1200,
                rentStartMonth: `${month}/${year}
            res.setHeader('Content-Disposition', `attachment; filename="${section}-export.csv"
            res.setHeader('Content-Disposition', `attachment; filename="${section}-export.pdf"
            doc.fontSize(20).text(`${section.toUpperCase()} Export
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}
                doc.text(`${index + 1}. ${JSON.stringify(item)}