import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from 'src/decorators/public.decorator';

import { MathService } from './math.service';

@Controller()
// @SkipThrottle()
@Public()
export class MathController {
  protected readonly logger = new Logger(MathController.name);

  constructor(private readonly mathService: MathService) {}

  @MessagePattern('ping')
  ping() {
    this.logger.log('ping!');
    return 'pong';
  }

  @MessagePattern('createMath')
  remove(@Payload() id: number) {
    this.logger.log('createMath!');
    return this.mathService.create(id);
  }

  @EventPattern('user_created')
  handleUserCreated(data: Record<string, unknown>) {
    this.logger.log({ msg: 'User created event received', data });
    // business logic
  }

  @MessagePattern('time.us.*')
  getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
    return new Date().toLocaleTimeString();
  }
}
