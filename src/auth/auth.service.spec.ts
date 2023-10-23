import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UserService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUserService = {
      find: () => Promise.resolve(users),
      findOne: (attrs) => {
        const user = users.find(
          (user) => user.id === attrs['id'] || user.email === attrs['email'],
        );

        if (!user) return Promise.resolve(null);
        return Promise.resolve(user);
      },
      create: ({ email, password, username }) => {
        const user = {
          id: Math.floor(Math.random() * 100) + 1,
          email,
          password,
          username,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with hashed password', async () => {
    const user = await service.signup({
      email: 'sample@sample.com',
      password: 'password',
      username: 'test-user',
    });

    expect(user.password).not.toEqual('password');

    const isMatch = await bcrypt.compare('password', user.password);
    expect(isMatch).toBeTruthy();
  });

  it('throws an error if email is already in use', async () => {
    const user = await service.signup({
      email: 'sample@sample.com',
      password: 'password',
      username: 'test-user',
    });

    await expect(service.signup(user)).rejects.toThrow(ConflictException);
  });

  it('return user for successful login', async () => {
    const user = {
      username: 'test-user',
      email: 'sample@sample.com',
      password: 'password',
    };

    await service.signup(user);
    const loggedInUser = await service.signin({ ...user });

    expect(loggedInUser).toBeDefined();
  });

  it('throws and error when wrong password', async () => {
    await expect(
      service.signin({
        email: 'sample@sample.com',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws an error when email is not recognized', async () => {
    await expect(
      service.signin({
        email: 'example@sample.com',
        password: 'password',
      }),
    ).rejects.toEqual(new UnauthorizedException('User not found.'));
  });
});
