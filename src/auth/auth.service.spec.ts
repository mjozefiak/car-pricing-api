import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

it('can create an instance of auth service', async () => {
  const fakeUserService = {
    find: () => Promise.resolve([]),
    create: (email: string, password: string, username: string) =>
      Promise.resolve({ id: 1, email, username }),
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

  const service = module.get(AuthService);

  expect(service).toBeDefined();
});
