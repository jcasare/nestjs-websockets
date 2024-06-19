import {
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MyGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private redisClient = new Redis({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    tls: {},
  });
  afterInit() {
    this.server.on('connection', async (socket) => {
      await this.redisClient.sadd('connectedClients', socket.id);

      this.server.emit('connectedUsers', {
        message: `User ${socket.id} connected`,
      });
    });
  }

  async handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    await this.redisClient.srem('connectedClients', client.id);

    this.server.emit('connectedUsers', {
      message: `User ${client.id} disconnected`,
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      type: 'New message',
      text: body,
    });
  }

  @SubscribeMessage('privateMessage')
  async onPrivateMessage(@MessageBody() body: any) {
    const { to, message } = body;
    const clients = await this.redisClient.smembers('connectedClients');
    if (clients.includes(to)) {
      this.server.to(to).emit('onPrivateMessage', {
        from: body.from,
        message: message,
      });
    } else {
      console.log(`User ${to} is not connected`);
    }
  }
}
