// src/notifications/notifications.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    const userId = (client.handshake.query.userId as string) || ''
    if (!userId) {
      client.emit('error', 'Missing userId')
      client.disconnect(true)
      return
    }
    client.join(userId)
  }

  handleDisconnect(_client: Socket) {
    // No-op; room membership is cleaned up automatically
  }

  sendNotification(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload)
  }
}
