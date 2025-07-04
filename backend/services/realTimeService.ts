import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

class RealTimeService {
  private io: SocketIOServer | null = null;

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-organization', (organizationId: string) => {
        socket.join(`org-${organizationId}`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  emitToOrganization(organizationId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`org-${organizationId}`).emit(event, data);
    }
  }

  emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export default new RealTimeService();