"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoice = exports.getInvoices = void 0;
const getInvoices = async (req, res) => {
    try {
        res.json({ success: true, data: [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res) => {
    try {
        res.json({ success: true, data: req.body });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createInvoice = createInvoice;
