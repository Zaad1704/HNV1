"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Removed 'fs' import as it's no longer needed for disk operations.
// import fs from 'fs'; 
// Configure how files are stored: in memory
const storage = multer_1.default.memoryStorage(); // <--- CHANGE: Use memoryStorage instead of diskStorage
// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Not an image! Please upload only images.'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage, // <--- Use the memory storage
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});
exports.default = upload;
//# sourceMappingURL=uploadMiddleware.js.map