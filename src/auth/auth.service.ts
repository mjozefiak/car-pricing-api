import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signup(user: SignUpDto) {
    const { email, password, username } = user;
    const existingUser = await this.userService.findOne({ email });

    if (existingUser) {
      throw new ConflictException('User is already exists.');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return this.userService.create({
      username,
      email,
      password: hash,
    });
  }

  async signin({ email, password }: LoginDto) {
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Wrong credentials!');
    }

    return user;
  }
}
