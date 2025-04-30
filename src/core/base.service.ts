import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * 公用方法
 */
@Injectable()
export class BaseService {
  @Inject()
  protected readonly configService: ConfigService;

  // @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger;

  async onApplicationBootstrap() {}
}
