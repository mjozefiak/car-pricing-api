import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from '../interceptor/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { Request } from 'express';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthGuard } from '../guard/auth.guard';

@Controller('users')
@Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(@Req() req: Request) {
    console.log(req);
    return await this.userService.find();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Please login or signup.');
    }

    return user;
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findOne({ id: parseInt(id) });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(parseInt(id), body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}
