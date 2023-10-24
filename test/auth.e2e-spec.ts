import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import setupApp from '../src/app.setup';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  const credentials = {
    password: 'password',
    email: 'mail@mail.com',
    username: 'test-user',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('should signup user [POST /auth/signup]', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(credentials)
      .expect(201)
      .then((res) => {
        const { id, email, username } = res.body;
        expect(id).toBeDefined();
        expect(username).toEqual(credentials.username);
        expect(email).toEqual(credentials.email);
        expect(res.get('Set-Cookie')).toBeUndefined();
      });
  });

  it('should throw an error with message "User is already exists." [POST /auth/signup]', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send(credentials);

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(credentials)
      .expect(409)
      .then((res) => {
        const { message } = res.body;

        expect(message).toEqual('User is already exists.');
        expect(res.get('Set-Cookie')).toBeUndefined();
      });
  });

  it('should signin user [POST /auth/singin]', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send(credentials);

    return await request(app.getHttpServer())
      .post('/auth/signin')
      .send(credentials)
      .expect(201)
      .then((res) => {
        const { id, username, email, password } = res.body;

        expect(id).toBeDefined();
        expect(username).toEqual(credentials.username);
        expect(email).toEqual(credentials.email);
        expect(password).toBeUndefined();
        expect(res.get('Set-Cookie')).toBeDefined();
      });
  });

  it('should throw an error with message "User not found." [POST /auth/singin]', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signin')
      .send(credentials)
      .expect(401)
      .then((res) => {
        const { message } = res.body;

        expect(message).toEqual('User not found.');
        expect(res.get('Set-Cookie')).toBeUndefined();
      });
  });

  it('should throw an error with message "Wrong credentials." [POST /auth/singin]', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ ...credentials, password: 'Wrong-password' });

    return await request(app.getHttpServer())
      .post('/auth/signin')
      .send(credentials)
      .expect(401)
      .then((res) => {
        const { message } = res.body;

        expect(message).toEqual('Wrong credentials.');
        expect(res.get('Set-Cookie')).toBeUndefined();
      });
  });

  it('should logout user and clear session [POST /auth/logout]', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send(credentials);
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(credentials);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookie)
      .expect(201)
      .then((res) => {
        expect(res.get('Set-Cookie')).toBeUndefined();
      });
  });
});
