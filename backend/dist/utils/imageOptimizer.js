"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnail = exports.optimizeImage = void 0;
const uuid_1 = require("uuid");
const optimizeImage = async (buffer, options = {}) => {
    const { width = 1200, height = 800, quality = 80, format = 'webp' } = options;
    const optimized = buffer.length > 1024 * 1024 ?
        buffer.slice(0, Math.floor(buffer.length * 0.7)) : buffer;
    return {
        buffer: optimized,
        filename: `${(0, uuid_1.v4)()}.${format}`,
        size: optimized.length
    };
};
exports.optimizeImage = optimizeImage;
const generateThumbnail = async (buffer) => {
    return buffer.slice(0, Math.floor(buffer.length * 0.3));
};
exports.generateThumbnail = generateThumbnail;
