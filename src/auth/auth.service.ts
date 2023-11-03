import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { Tokens } from './type/tokens.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './auth.entity';
import * as bcrypt from 'bcrypt';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Auth) private repo: Repository<Auth>,
  ) {}

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

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<Omit<User, 'id'>> | null> {
    const user = await this.userService.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    }

    return null;
  }

  async getTokens(user: User): Promise<Tokens> {
    const payload = { username: user.email, sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_KEY'),
        expiresIn: '5m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_KEY'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(user: User, token: string) {
    const existingTokens = await this.repo.findBy({
      user: { id: user.id },
    });

    if (!existingTokens) {
      throw new UnauthorizedException();
    }

    for (const existingToken of existingTokens) {
      if (await bcrypt.compare(existingToken.refreshToken, token)) {
        await this.repo.remove(existingToken);

        const { refreshToken, accessToken } = await this.getTokens(user);
        await this.saveRefreshToken(user, refreshToken);
        return { refreshToken, accessToken };
      }
    }

    throw new UnauthorizedException();
  }

  async saveRefreshToken(user: User, token: string) {
    const hashedRefreshToken = await bcrypt.hash(token, 10);
    const storedToken = this.repo.create({
      refreshToken: hashedRefreshToken,
      expireDate: new Date(
        new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
    storedToken.user = user;
    await this.repo.save(storedToken);
  }

  async login(user: User): Promise<Tokens> {
    const { refreshToken, accessToken } = await this.getTokens(user);
    await this.saveRefreshToken(user, refreshToken);
    return { refreshToken, accessToken };
  }

  async logout(userId: number, refreshToken: string, global: boolean) {
    const tokens = await this.repo.find({ where: { user: { id: userId } } });
    if (global) {
      await this.repo.remove(tokens);
    } else {
      for (const token of tokens) {
        if (await bcrypt.compare(refreshToken, token.refreshToken)) {
          await this.repo.remove(token);
          break;
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async removeExpiredTokens() {
    const tokens = await this.repo.find();
    const now = new Date().toISOString();
    for (const token of tokens) {
      if (token.expireDate < now) {
        await this.repo.remove(token);
      }
    }
  }
}
