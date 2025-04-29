import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BullmqQueueName } from '../../constants/bullmq.constant';

import { CommonUtil } from '../../utils/common.util';
import { Logger } from '@nestjs/common';

@Processor(BullmqQueueName.AUDIO)
export class AudioProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioProcessor.name);

  onModuleInit() {
    // Access the worker instance and attach event listeners
    const worker = this.worker;

    worker.on('active', (job) => {
      job.data._startTime = Date.now();
      this.logger.log(
        `Job ${job.id} has started processing with data: ${JSON.stringify(job.data)}`,
      );
    });

    worker.on('progress', (job, progress) => {
      this.logger.log(`Job ${job.id} reported progress: ${progress}`);
    });

    worker.on('completed', (job, result) => {
      const startTime = job.data._startTime || 0;
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      this.logger.log(`Job ${job.id} has completed in ${executionTime}ms with result: ${result}`);
    });

    worker.on('failed', (job, error) => {
      this.logger.error(`Job ${job?.id} has failed with error: ${error}`);
    });

    worker.on('error', (error) => {
      this.logger.error('Worker encountered an error: ${error}');
    });

    worker.on('drained', () => {
      this.logger.log('Queue is drained, no more jobs to process');
    });
  }

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
