import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeAuthService = {
      async signup(user: SignUpDto): Promise<User> {
        return Promise.resolve({ id: 1, ...user } as User);
      },
      async signin({ email, password }: LoginDto): Promise<User> {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'random@mail.com', password: 'randomPassword13' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('should create user and return it', async () => {
    const newUser = {
      email: 'sample@mail.com',
      username: 'username',
      password: 'example.com',
    };
    const user = await controller.signup(newUser);

    expect(user).toEqual({ id: 1, ...newUser });
  });
});
