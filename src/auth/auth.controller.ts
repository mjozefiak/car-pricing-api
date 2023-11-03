import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Response, Request } from 'express';
import { User } from '../user/user.entity';
import { LogoutDto } from './dto/logout.dto';
import { AccessAuthGuard } from './guard/access-auth.guard';

@Controller('auth')
// @Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LogoutDto,
  ) {
    const refreshToken = req.cookies.refreshToken;
    const user = req.user as User;
    console.log(user);
    await this.authService.logout(user.id, refreshToken, body.global);
    return res.cookie('refreshToken', '');
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, accessToken } = await this.authService.login(
      req.user as User,
    );
    res.cookie('refreshToken', refreshToken);
    return { accessToken };
  }
}
