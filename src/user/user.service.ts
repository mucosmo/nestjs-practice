import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';

import { Article } from 'src/article/entities/article.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/constants/action.constants';
import { EMicroservice } from 'src/constants/microservice.constants';
import { BaseService } from 'src/core/base.service';

import { BullmqQueueName } from '../constants/bullmq.constant';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends BaseService {
  protected readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(BullmqQueueName.AUDIO) private audioQueue: Queue,
    @InjectQueue(BullmqQueueName.VIDEO) private videoQueue: Queue,
    private caslAbilityFactory: CaslAbilityFactory,
    @Inject(EMicroservice.MATH_SERVICE) private client: ClientProxy,
  ) {
    super();
  }

  async create(createUserDto: CreateUserDto) {
    await this.usersRepository.save(createUserDto);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    await this.cacheManager.set('key', 'cache-value', 1000);
    const value = await this.cacheManager.get<string>('key');
    return `This action returns a #${id} user: ${value}`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  //这里用 User, 还是 CreateUserDto
  async createMany(users: CreateUserDto[]) {
    //FIXME: 这里不对，每次都创建一个连接肯定慢
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(User, users[0]);
      await queryRunner.manager.save(User, users[1]);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      //FIXME: 这里的错误处理不太好
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  @Cron('45 * * 1 * *')
  handleCron() {
    this.logger.warn("Called when the current second is 45 and it's first day of the month ");
  }

  // @Interval(30000)
  handleInterval() {
    this.logger.warn('Called every 30 seconds');
  }

  @Timeout('notification', 10)
  handleTimeout() {
    this.logger.warn('this is warn ', '!!I AM NOT LABEL!!');
    this.logger.log('this is info ');
    this.logger.debug('this is debug');
    this.logger.error('this is 1');
    this.logger.error({ message: 'this is 2', a: 'aaa' });
    this.logger.error({ message: 'this is 3' });
    this.logger.error({ named: 'this is 4' });
    this.logger.error({ error: 'this is 5', message: 'this is 6' });
    this.logger.error({ error: 'this is 7' });
    this.logger.log('undefined');
    this.logger.log({ message: 'undefined' }); // failed, print as this.logger.log('undefined')
    this.logger.error({ msg: '', message: 'undefined' }); // failed
    this.logger.error({ error: new Error('this is 8') });
    this.logger.log({ errors: undefined, name: null });
    this.logger.log({ message: undefined, error: undefined }); // failed

    this.logger.error(new Error('this is error object'));
    this.logger.log({ a: 1, b: 2 });
    this.logger.log({ 3: 1, 4: 2, err: new Error('error in object') });
    this.logger.error({ error: new Error('error in object') });
    this.logger.log({ message: 'hahha', error: 'this is 10' });
    this.logger.warn({ message: 'hahha', error: 'this is 11' });
    this.logger.log({ message3: 'hahha', error3: 'meerror' });
  }

  @Timeout(3000)
  async addAudioJob() {
    await this.audioQueue.add(
      'jobname',
      {
        data: {
          age: 13,
          type: 'audio',
        },
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    await this.videoQueue.add('jobname', {
      data: {
        age: 14,
        type: 'video',
      },
    });
  }

  async getJobProgress(jobId: string) {
    const job = await this.audioQueue.getJob(jobId);
    const progress = job?.progress;
    this.logger.log(`job id: ${job.id}, state: ${await job.getState()}, progress: ${progress}`);
  }

  /**根据名称查找 */
  // eslint-disable-next-line @typescript-eslint/require-await
  async findOneByName(username: string) {
    const users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
        roles: ['user'],
        isAdmin: false,
      },
      {
        userId: 2,
        username: 'maria',
        password: 'guess',
        roles: ['admin'],
        isAdmin: true,
      },
    ];
    return users.find((user) => user.username === username);
  }

  featCasl() {
    const user = new User();
    user.isAdmin = false;

    let ability = this.caslAbilityFactory.createForUser(user);
    const ability1 = ability.can(Action.Read, Article); // true
    const ability2 = ability.can(Action.Delete, Article); // false
    const ability3 = ability.can(Action.Create, Article); // false

    user.id = 1;
    ability = this.caslAbilityFactory.createForUser(user);

    const article = new Article();
    article.authorId = user.id;

    const ability4 = ability.can(Action.Update, article); // true

    article.authorId = 2;
    const ability5 = ability.can(Action.Update, article); // false

    return { ability1, ability2, ability3, ability4, ability5 };
  }

  @Timeout(100)
  async microservice(id: number) {
    this.client.send('createMath', { id }).subscribe({
      next: (response) => this.logger.log({ msg: 'createMath resonse', response }),
      error: (err) => this.logger.error({ msg: 'createMath error', err }),
    });

    const response = await firstValueFrom(this.client.send('ping', {}));
    this.logger.log({ response });

    this.client.emit('user_created', { id, name: 'John Doe' });
  }
}
