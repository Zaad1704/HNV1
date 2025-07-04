"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealTimeService = exports.initializeRealTimeService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
class RealTimeService {
    constructor(server) {
        this.connectedUsers = new Map(); // userId -> socketId
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        this.setupMiddleware();
        this.setupEventHandlers();

    setupMiddleware() {
        // Authentication middleware
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication error: No token provided'));

                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.organizationId = decoded.organizationId;
                socket.role = decoded.role;
                logger_1.logger.info(
            logger_1.logger.info(`User ${socket.userId} connected via WebSocket
                    socket.join(`org:${socket.organizationId}
                socket.join(`user:${socket.userId}
                socket.join(`property:${propertyId}
                logger_1.logger.info(
                socket.leave(`property:${propertyId}
                logger_1.logger.info(
                logger_1.logger.info(`User ${socket.userId} disconnected
            this.io.to(`user:${userId}
        this.io.to(`org:${organizationId}
        this.io.to(`property:${propertyId}
            message: `Payment of $${paymentData.amount} received from ${paymentData.tenantName}
            message: `New maintenance request: ${requestData.title}
            message: `Lease expiring soon for ${leaseData.tenantName} at ${leaseData.propertyName}
            message: `Rent overdue for ${rentData.tenantName}
        const room = this.io.sockets.adapter.rooms.get(`org:${organizationId}