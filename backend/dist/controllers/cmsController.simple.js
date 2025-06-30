"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCMSContent = exports.getCMSContent = void 0;
const getCMSContent = async (req, res) => {
    try {
        res.json({ success: true, data: [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCMSContent = getCMSContent;
const createCMSContent = async (req, res) => {
    try {
        res.json({ success: true, data: req.body });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCMSContent = createCMSContent;
