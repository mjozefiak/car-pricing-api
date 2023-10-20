import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { Request } from 'express';

@Controller('users')
@Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(@Req() req: Request) {
    console.log(req);
    return await this.userService.find();
  }

  @Get(':id')
  async getUser(@Param() params: Pick<User, 'id'>) {
    const { id } = params;
    const user = await this.userService.findOne({ id });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  @Put(':id')
  async updateUser(
    @Param() params: Pick<User, 'id'>,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.update(params.id, body);
  }

  @Delete(':id')
  async deleteUser(@Param() params: Pick<User, 'id'>) {
    return this.userService.remove(params.id);
  }
}
