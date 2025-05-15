import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BaseGateway implements OnGatewayConnection {
  constructor(private jwtService: JwtService) {}
  protected readonly logger = new Logger(this.constructor.name);

  async handleConnection(client: Socket) {
    try {
      // 从握手数据中获取 token
      const token =
        (client.handshake.query.token as string) ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new WsException(
          `No authentication token, client: ${JSON.stringify(client.handshake || {})}`,
        );
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = payload;
    } catch (error) {
      this.logger.error(error);
      client.disconnect(true);
    }
  }
}
