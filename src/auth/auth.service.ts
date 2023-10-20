import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(Auth) private repo: Repository<Auth>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getTokens({ id, email }: Pick<User, 'id' | 'email'>) {
    const payload = {
      sub: {
        userId: id,
      },
      user: email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_KEY,
        expiresIn: 60,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_KEY,
        expiresIn: 60 * 60 * 24 * 7,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

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
      throw new NotFoundException('User not found.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Wrong credentials!');
    }

    const { accessToken, refreshToken } = await this.getTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const createdToken = this.repo.create({ token: hashedRefreshToken });
    await this.repo.save(createdToken);

    user.tokens.push(createdToken);
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }

  async logout() {}

  async refreshToken() {}
}
