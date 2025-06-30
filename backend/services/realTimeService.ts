import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
  role?: string;
}

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
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.id;
        socket.organizationId = decoded.organizationId;
        socket.role = decoded.role;
        
        logger.info(`Socket authenticated for user ${decoded.id}`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket & { userId?: string; organizationId?: string; role?: string }) => {
      logger.info(`User ${socket.userId} connected via WebSocket`);
      
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
      socket.on('join_property', (propertyId: string) => {
        socket.join(`property:${propertyId}`);
        logger.info(`User ${socket.userId} joined property room ${propertyId}`);
      });

      socket.on('leave_property', (propertyId: string) => {
        socket.leave(`property:${propertyId}`);
        logger.info(`User ${socket.userId} left property room ${propertyId}`);
      });

      socket.on('typing_start', (data: { room: string; userName: string }) => {
        socket.to(data.room).emit('user_typing', {
          userId: socket.userId,
          userName: data.userName
        });
      });

      socket.on('typing_stop', (data: { room: string }) => {
        socket.to(data.room).emit('user_stopped_typing', {
          userId: socket.userId
        });
      });

      socket.on('disconnect', () => {
        logger.info(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  // Notification methods
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit(event, data);
      return true;
    }
    return false;
  }

  sendToOrganization(organizationId: string, event: string, data: any) {
    this.io.to(`org:${organizationId}`).emit(event, data);
  }

  sendToProperty(propertyId: string, event: string, data: any) {
    this.io.to(`property:${propertyId}`).emit(event, data);
  }

  // Specific notification types
  notifyPaymentReceived(organizationId: string, paymentData: any) {
    this.sendToOrganization(organizationId, 'payment_received', {
      type: 'payment',
      message: `Payment of $${paymentData.amount} received from ${paymentData.tenantName}`,
      data: paymentData,
      timestamp: new Date()
    });
  }

  notifyMaintenanceRequest(organizationId: string, propertyId: string, requestData: any) {
    this.sendToOrganization(organizationId, 'maintenance_request', {
      type: 'maintenance',
      message: `New maintenance request: ${requestData.title}`,
      data: requestData,
      timestamp: new Date()
    });
    
    this.sendToProperty(propertyId, 'maintenance_request', requestData);
  }

  notifyLeaseExpiring(organizationId: string, leaseData: any) {
    this.sendToOrganization(organizationId, 'lease_expiring', {
      type: 'lease',
      message: `Lease expiring soon for ${leaseData.tenantName} at ${leaseData.propertyName}`,
      data: leaseData,
      timestamp: new Date()
    });
  }

  notifyRentOverdue(organizationId: string, tenantId: string, rentData: any) {
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
  notifySystemMaintenance(message: string, scheduledTime: Date) {
    this.io.emit('system_maintenance', {
      type: 'system',
      message,
      scheduledTime,
      timestamp: new Date()
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get users in organization
  getUsersInOrganization(organizationId: string): string[] {
    const room = this.io.sockets.adapter.rooms.get(`org:${organizationId}`);
    return room ? Array.from(room) : [];
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}

let realTimeService: RealTimeService;

export const initializeRealTimeService = (server: HTTPServer) => {
  realTimeService = new RealTimeService(server);
  return realTimeService;
};

export const getRealTimeService = () => {
  if (!realTimeService) {
    throw new Error('RealTimeService not initialized. Call initializeRealTimeService first.');
  }
  return realTimeService;
};