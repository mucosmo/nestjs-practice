import * as os from 'os';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class InstanceInfoUtil implements OnModuleInit {
  private readonly logger = new Logger(InstanceInfoUtil.name);
  private instanceId: string;
  private hostname: string;
  private nodeAppInstance: string;
  private pmId: string;

  onModuleInit() {
    this.hostname = os.hostname();
    this.nodeAppInstance = process.env.NODE_APP_INSTANCE || '0';
    this.pmId = process.env.pm_id || 'N/A';
    this.instanceId = `${this.hostname}-${this.nodeAppInstance}`;

    this.logger.log(`=== Instance info ===`);
    this.logger.log(`Instance ID: ${this.instanceId}`);
    this.logger.log(`PM2 ID: ${this.pmId}`);
    this.logger.log(`Hostname: ${this.hostname}`);
    this.logger.log(`NODE_APP_INSTANCE: ${this.nodeAppInstance}`);
    this.logger.log(`===================`);
  }

  getInstanceId(): string {
    return this.instanceId;
  }

  getPmId(): string {
    return this.pmId;
  }

  getNodeAppInstance(): string {
    return this.nodeAppInstance;
  }

  getInstanceInfo() {
    return {
      instanceId: this.instanceId,
      hostname: this.hostname,
      nodeAppInstance: this.nodeAppInstance,
      pmId: this.pmId,
    };
  }
}
