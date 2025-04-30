import { WorkerHost } from '@nestjs/bullmq';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export abstract class BaseProcessor extends WorkerHost implements OnModuleInit {
  //TODO: 如何在这里定义待名称的 logger
  protected abstract readonly logger: Logger;

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
      this.logger.log(`Job ${job.id} reported progress: ${Number(progress)}`);
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
      this.logger.error(`Worker encountered an error: ${error}`);
    });

    worker.on('drained', () => {
      this.logger.log('Queue is drained, no more jobs to process');
    });
  }

  // Each processor must implement this method
  abstract process(job: Job<any, any, string>): Promise<any>;
}
