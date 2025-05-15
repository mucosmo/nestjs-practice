import { Module } from '@nestjs/common';

import { EventsGateway } from './events.gateway';
import { RoomsGateway } from './rooms.gateway';

@Module({
  providers: [EventsGateway, RoomsGateway],
})
export class EventsModule {}
