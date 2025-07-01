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
router.get('/monthly-collection', authMiddleware_1.protect, async (req, res) => {
    try {
        const { month, year } = req.query;
        const collectionData = [
            {
                _id: '1',
                tenantName: 'John Doe',
                unitNo: 'A101',
                rentAmount: 1200,
                rentStartMonth: `${month}/${year}`,
                overdueMonths: [],
                isCollected: false,
                propertyName: 'Sunset Apartments'
            }
        ];
        res.json({ success: true, data: collectionData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch collection data' });
    }
});
router.post('/export', authMiddleware_1.protect, async (req, res) => {
    try {
        const { section, dateRange, format, startDate, endDate } = req.body;
        const data = [
            { name: 'Sample Data', date: new Date().toISOString(), amount: 1000 }
        ];
        if (format === 'csv') {
            const parser = new Parser();
            const csv = parser.parse(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${section}-export.csv"`);
            res.send(csv + '\n\nPowered by HNV Property Management Solutions');
        }
        else if (format === 'pdf') {
            const doc = new pdfkit_1.default();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${section}-export.pdf"`);
            doc.pipe(res);
            doc.fontSize(20).text(`${section.toUpperCase()} Export`, 100, 100);
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 100, 130);
            let yPosition = 160;
            data.forEach((item, index) => {
                doc.text(`${index + 1}. ${JSON.stringify(item)}`, 100, yPosition);
                yPosition += 20;
            });
            doc.fontSize(10).text('Powered by HNV Property Management Solutions', 100, doc.page.height - 50);
            doc.end();
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Export failed' });
    }
});
exports.default = router;
