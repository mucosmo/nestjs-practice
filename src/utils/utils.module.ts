import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonUtil } from './common.util';
import { EncryptUtil } from './encypt.util';
import { NetworkUtil } from './network.util';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EncryptUtil, NetworkUtil, CommonUtil],
  exports: [EncryptUtil, NetworkUtil, CommonUtil],
})
export class UtilsModule {}
