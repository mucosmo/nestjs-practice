import { Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map, timeInterval } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  protected readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    this.logger.log({ msg: 'findAll', data });
    return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })));
  }

  @SubscribeMessage('identity')
  identity(@MessageBody() data: number): number {
    return data;
  }

  @Interval(10000)
  handleInterval() {
    const connectedClients = this.server.sockets.sockets.size;
    this.logger.log(`Connected clients: ${connectedClients}`);
    this.server.emit('broadcast', { msg: 'This is a broadcast message' });
  }
}
