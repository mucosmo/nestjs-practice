import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.usersRepository.save(createUserDto);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    await this.cacheManager.set('key', 'cache-value', 1000);
    const value = await this.cacheManager.get('key');
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

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.warn('Called when the current second is 45');
  }

  @Interval(30000)
  handleInterval() {
    this.logger.warn('Called every 30 seconds');
  }

  @Timeout('notification', 5000)
  handleTimeout() {
    this.logger.warn('Called once after 5 seconds');
  }
}
