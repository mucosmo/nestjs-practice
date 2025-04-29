import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Sse,
  ParseIntPipe,
  UseGuards,
  ParseArrayPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Observable, of, interval } from 'rxjs';
import { map, take, toArray } from 'rxjs/operators';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { User as UserDec } from '../decorators/user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/batch')
  async createBatch(@Body(new ParseArrayPipe({ items: CreateUserDto })) users: CreateUserDto[]) {
    return await this.userService.createMany(users);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('/observable') //类似 promise
  findAllObserable() {
    // 每秒发出一个递增的数字，共发出5个
    return of([12, 34, 56]);
  }

  @Sse('/stream') //事件流响应
  @UseGuards(AuthGuard)
  findAllEventStream() {
    // 每秒发出一个递增的数字，共发出5个
    return interval(200).pipe(
      take(5),
      map(
        (num) =>
          ({
            data: { value: num }, // 数据必须包装在 data 属性中
          }) as MessageEvent,
      ),
    );
  }

  @Get(':id')
  findOne(@UserDec('firstName') firstName: string, @Param('id', ParseIntPipe) id: string) {
    // const mongoConfig = this.configService.get('mongo');
    return this.userService.findOne(+id);
  }

  @Get('/by/ids')
  findByIds(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return ids;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
