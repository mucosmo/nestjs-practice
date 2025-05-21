import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextType = context.getType();
    //TODO: add throttler for microservices
    if (contextType !== 'http') {
      return true;
    }
    return super.canActivate(context);
  }
}
