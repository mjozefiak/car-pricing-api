import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers() {
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

  @Patch(':id')
  async updateUser(
    @Param() params: Pick<User, 'id'>,
    @Body() body: Partial<User>,
  ) {
    return this.userService.update(params.id, body);
  }

  @Delete(':id')
  async deleteUser(@Param() params: Pick<User, 'id'>) {
    return this.userService.remove(params.id);
  }
}
