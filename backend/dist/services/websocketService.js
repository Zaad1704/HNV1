"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class WebSocketService {
    constructor() {
        this.io = null;
    }
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                credentials: true
            }
        });
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error('Authentication error'));
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.organizationId = decoded.organizationId;
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            socket.join(`org_${socket.organizationId}`);
            socket.join(`user_${socket.userId}`);
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.userId);
            });
        });
    }
    notifyOrganization(orgId, event, data) {
        if (this.io) {
            this.io.to(`org_${orgId}`).emit(event, data);
        }
    }
    notifyUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user_${userId}`).emit(event, data);
        }
    }
    broadcastToAll(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}
exports.default = new WebSocketService();
