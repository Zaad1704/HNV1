"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
class RealTimeService {
    constructor() {
        this.io = null;
    }
}
initialize(server, http_1.Server);
void { this: .io = new socket_io_1.Server(server, {}, cors, { origin: "*",
        methods: ["GET", "POST"] })
};
;
this.io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-organization', (organizationId) => { }, socket.join(`org-${organizationId}`));
});
socket.on('disconnect', () => { console.log('User disconnected:', socket.id); });
;
emitToOrganization(organizationId, string, event, string, data, any);
void {
    : .io
};
{
    ` }


      this.io.to(`;
    org - $;
    {
        organizationId;
    }
    `).emit(event, data);


  emitToAll(event: string, data: any): void { if (this.io) { }
      this.io.emit(event, data);





export default new RealTimeService();`;
}
