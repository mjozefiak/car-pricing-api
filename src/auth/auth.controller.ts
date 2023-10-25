import { Body, Controller, Post, Session } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Serialize } from '../interceptor/serialize.interceptor';
import { UserDto } from '../user/dto/user.dto';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: LoginDto, @Session() session: any) {
    const user = await this.authService.signin(body);
    session.userId = user.id;
    return user;
  }

  @Post('logout')
  async logout(@Session() session: any) {
    return (session.userId = null);
  }
}
