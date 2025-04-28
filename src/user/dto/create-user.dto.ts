import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumberString()
  @IsOptional()
  id: number;

  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsBoolean()
  isActive: boolean;

  hobby: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
