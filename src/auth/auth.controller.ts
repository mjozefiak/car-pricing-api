import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() body: SignUpDto) {
    const { email } = body;
    const existingUser = await this.userService.findOne({ email });

    if (existingUser) {
      throw new ConflictException('User is already exists');
    }

    return this.userService.create(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    console.log(body);
  }
}
