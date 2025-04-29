import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BullmqQueueName } from '../../constants/bullmq.constant';

import { CommonUtil } from '../../utils/common.util';
import { Logger } from '@nestjs/common';

import { BaseProcessor } from '../../processors/base.processor';

@Processor(BullmqQueueName.AUDIO)
export class AudioProcessor extends BaseProcessor {
  protected readonly logger = new Logger(AudioProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    for (let i = 0; i < 3; i++) {
      await CommonUtil.sleep(200);
      progress += 1;
      await job.updateProgress(progress);
    }
    return 'Job completed successfully';
  }
}
