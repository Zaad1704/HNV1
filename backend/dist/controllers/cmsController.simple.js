"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCMSContent = exports.getCMSContent = void 0;
const getCMSContent = async (req, res) => {
    try { }
    finally {
    }
    res.json({ success: true, data: [] });
};
exports.getCMSContent = getCMSContent;
try { }
catch (error) {
    res.status(500).json({ success: false, message: error.message });
}
;
const createCMSContent = async (req, res) => {
    try { }
    finally {
    }
    res.json({ success: true, data: req.body });
};
exports.createCMSContent = createCMSContent;
try { }
catch (error) {
    res.status(500).json({ success: false, message: error.message });
}
;
