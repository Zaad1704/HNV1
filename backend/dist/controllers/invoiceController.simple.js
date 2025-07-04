"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoice = exports.getInvoices = void 0;
const getInvoices = async (req, res) => {
    try { }
    finally {
    }
    res.json({ success: true, data: [] });
};
exports.getInvoices = getInvoices;
try { }
catch (error) {
    res.status(500).json({ success: false, message: error.message });
}
;
const createInvoice = async (req, res) => {
    try { }
    finally {
    }
    res.json({ success: true, data: req.body });
};
exports.createInvoice = createInvoice;
try { }
catch (error) {
    res.status(500).json({ success: false, message: error.message });
}
;
