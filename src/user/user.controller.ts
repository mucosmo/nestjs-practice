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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Observable, of, interval } from 'rxjs';
import { map, take, toArray } from 'rxjs/operators';

import { Role } from 'src/constants/role.constants';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { EncryptUtil } from 'src/utils/encypt.util';

import { User as UserDec } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
    private encryptUtil: EncryptUtil, // 这里可以注入 EncryptUtil
  ) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/batch')
  async createBatch(@Body(new ParseArrayPipe({ items: CreateUserDto })) users: CreateUserDto[]) {
    return await this.userService.createMany(users);
  }

  @Public()
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

  @Get('/feat/compression')
  getCompression() {
    const result = Array(10005)
      .fill({})
      .map((item, index) => {
        return {
          id: index,
          name: `name-${index}`,
        };
      });
    return result;
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Get('/feat/casl')
  verifyCasl() {
    const result = this.userService.featCasl();
    return result;
  }

  @Get('/feat/encrypt')
  async encrypt() {
    const { iv, data } = await this.encryptUtil.encypt('He1l0 W0r1d to be encrypted');
    const result = this.encryptUtil.decrypt(data, iv);
    return result;
  }
}
