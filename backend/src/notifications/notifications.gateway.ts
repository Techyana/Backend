import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications', cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Get userId from query params
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId); // Join room for this user
    }
    // Optionally authenticate client here
  }

  handleDisconnect(client: Socket) {
    // Optionally handle disconnect logic
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
  }
}
