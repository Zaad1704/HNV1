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
    }
    setupMiddleware() {
        // Authentication middleware
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.organizationId = decoded.organizationId;
                socket.role = decoded.role;
                logger_1.logger.info(`Socket authenticated for user ${decoded.id}`);
                next();
            }
            catch (error) {
                logger_1.logger.error('Socket authentication failed:', error);
                next(new Error('Authentication error: Invalid token'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`User ${socket.userId} connected via WebSocket`);
            // Store connection
            if (socket.userId) {
                this.connectedUsers.set(socket.userId, socket.id);
                // Join organization room
                if (socket.organizationId) {
                    socket.join(`org:${socket.organizationId}`);
                }
                // Join user-specific room
                socket.join(`user:${socket.userId}`);
            }
            // Handle real-time events
            socket.on('join_property', (propertyId) => {
                socket.join(`property:${propertyId}`);
                logger_1.logger.info(`User ${socket.userId} joined property room ${propertyId}`);
            });
            socket.on('leave_property', (propertyId) => {
                socket.leave(`property:${propertyId}`);
                logger_1.logger.info(`User ${socket.userId} left property room ${propertyId}`);
            });
            socket.on('typing_start', (data) => {
                socket.to(data.room).emit('user_typing', {
                    userId: socket.userId,
                    userName: data.userName
                });
            });
            socket.on('typing_stop', (data) => {
                socket.to(data.room).emit('user_stopped_typing', {
                    userId: socket.userId
                });
            });
            socket.on('disconnect', () => {
                logger_1.logger.info(`User ${socket.userId} disconnected`);
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                }
            });
        });
    }
    // Notification methods
    sendToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(`user:${userId}`).emit(event, data);
            return true;
        }
        return false;
    }
    sendToOrganization(organizationId, event, data) {
        this.io.to(`org:${organizationId}`).emit(event, data);
    }
    sendToProperty(propertyId, event, data) {
        this.io.to(`property:${propertyId}`).emit(event, data);
    }
    // Specific notification types
    notifyPaymentReceived(organizationId, paymentData) {
        this.sendToOrganization(organizationId, 'payment_received', {
            type: 'payment',
            message: `Payment of $${paymentData.amount} received from ${paymentData.tenantName}`,
            data: paymentData,
            timestamp: new Date()
        });
    }
    notifyMaintenanceRequest(organizationId, propertyId, requestData) {
        this.sendToOrganization(organizationId, 'maintenance_request', {
            type: 'maintenance',
            message: `New maintenance request: ${requestData.title}`,
            data: requestData,
            timestamp: new Date()
        });
        this.sendToProperty(propertyId, 'maintenance_request', requestData);
    }
    notifyLeaseExpiring(organizationId, leaseData) {
        this.sendToOrganization(organizationId, 'lease_expiring', {
            type: 'lease',
            message: `Lease expiring soon for ${leaseData.tenantName} at ${leaseData.propertyName}`,
            data: leaseData,
            timestamp: new Date()
        });
    }
    notifyRentOverdue(organizationId, tenantId, rentData) {
        this.sendToOrganization(organizationId, 'rent_overdue', {
            type: 'rent',
            message: `Rent overdue for ${rentData.tenantName}`,
            data: rentData,
            timestamp: new Date()
        });
        // Also notify the tenant
        this.sendToUser(tenantId, 'rent_overdue_notice', {
            type: 'rent',
            message: 'Your rent payment is overdue',
            data: rentData,
            timestamp: new Date()
        });
    }
    // System notifications
    notifySystemMaintenance(message, scheduledTime) {
        this.io.emit('system_maintenance', {
            type: 'system',
            message,
            scheduledTime,
            timestamp: new Date()
        });
    }
    // Get connected users count
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    // Get users in organization
    getUsersInOrganization(organizationId) {
        const room = this.io.sockets.adapter.rooms.get(`org:${organizationId}`);
        return room ? Array.from(room) : [];
    }
    // Broadcast to all connected clients
    broadcast(event, data) {
        this.io.emit(event, data);
    }
}
let realTimeService;
const initializeRealTimeService = (server) => {
    realTimeService = new RealTimeService(server);
    return realTimeService;
};
exports.initializeRealTimeService = initializeRealTimeService;
const getRealTimeService = () => {
    if (!realTimeService) {
        throw new Error('RealTimeService not initialized. Call initializeRealTimeService first.');
    }
    return realTimeService;
};
exports.getRealTimeService = getRealTimeService;
//# sourceMappingURL=realTimeService.js.map