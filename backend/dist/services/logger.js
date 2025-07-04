"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.transports = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.join(__dirname, '../logs');
exports.logger = winston_1.default.createLogger({ level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine() }, winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
new winston_1.default.transports.File({ filename: path_1.default.join(logDir, 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5 }),
    new winston_1.default.transports.Console({ format: winston_1.default.format.combine(),
        winston: winston_1.default, : .format.colorize(),
        winston: winston_1.default, : .format.simple() });
;
exports.auditLogger = winston_1.default.createLogger({ level: 'info',
    format: winston_1.default.format.combine(),
    winston: winston_1.default, : .format.timestamp(),
    winston: winston_1.default, : .format.json() });
;
