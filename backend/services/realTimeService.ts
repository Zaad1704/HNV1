import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
  role?: string;

class RealTimeService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.id;
        socket.organizationId = decoded.organizationId;
        socket.role = decoded.role;
        
        logger.info(
      logger.info(`User ${socket.userId} connected via WebSocket
          socket.join(`org:${socket.organizationId}
        socket.join(`user:${socket.userId}
        socket.join(`property:${propertyId}
        logger.info(
        socket.leave(`property:${propertyId}
        logger.info(
        logger.info(`User ${socket.userId} disconnected
      this.io.to(`user:${userId}
    this.io.to(`org:${organizationId}
    this.io.to(`property:${propertyId}
      message: `Payment of $${paymentData.amount} received from ${paymentData.tenantName}
      message: `New maintenance request: ${requestData.title}
      message: `Lease expiring soon for ${leaseData.tenantName} at ${leaseData.propertyName}
      message: `Rent overdue for ${rentData.tenantName}
    const room = this.io.sockets.adapter.rooms.get(`org:${organizationId}