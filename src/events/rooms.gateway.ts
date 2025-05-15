import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway {
  protected readonly logger = new Logger(RoomsGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room: string): Promise<void> {
    await client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);

    // 可选：通知客户端已成功加入房间
    client.emit('joinedRoom', { room });

    // 可选：通知房间其他成员有新用户加入
    client.to(room).emit('userJoined', { userId: client.id });
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, room: string): Promise<void> {
    await client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);

    // 可选：通知客户端已离开房间
    client.emit('leftRoom', { room });

    // 可选：通知房间其他成员有用户离开
    client.to(room).emit('userLeft', { userId: client.id });
  }

  @SubscribeMessage('roomMessage')
  handleRoomMessage(client: Socket, payload: { room: string; message: string }): void {
    this.logger.log(`Message to room ${payload.room}: ${payload.message}`);

    // 向房间内所有客户端(除发送者外)广播消息
    client.to(payload.room).emit('roomMessage', {
      sender: client.id,
      message: payload.message,
    });

    // 或从服务器向整个房间广播(包括发送者)
    this.server.to(payload.room).emit('roomMessage', {
      sender: client.id,
      message: payload.message,
    });
  }
}
