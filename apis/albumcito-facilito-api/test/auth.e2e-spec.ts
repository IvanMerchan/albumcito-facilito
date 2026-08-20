import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { resetDatabase } from './../src/prisma/reset-database';
import { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import { UserDto } from './../src/auth/dto/user.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await resetDatabase(app.get<PrismaService>(PrismaService));
  });

  it('/auth/signup (POST) registers a user and returns an access token', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'ivan.merchan@gmail.com',
        password: 'super-secret',
        name: 'Iván Merchán',
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as AuthResponseDto;
        expect(body.user.username).toBe('ivan-merchan');
        expect(typeof body.accessToken).toBe('string');
        expect(body.user).not.toHaveProperty('passwordHash');
      });
  });

  it('/auth/signup (POST) returns 400 for an invalid body', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: 'short', name: '' })
      .expect(400);
  });

  it('/auth/signup (POST) returns 409 for a duplicate email', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'ivan.merchan@gmail.com',
        password: 'another-secret',
        name: 'Otro Nombre',
      })
      .expect(409);
  });

  it('/auth/login (POST) returns 401 for the wrong password', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ivan.merchan@gmail.com', password: 'wrong-password' })
      .expect(401);
  });

  it('/auth/login (POST) returns 200 for correct credentials', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ivan.merchan@gmail.com', password: 'super-secret' })
      .expect(200);
  });

  it('/auth/me (GET) returns the current user for a valid token', async () => {
    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'ivan.merchan@gmail.com',
        password: 'super-secret',
        name: 'Iván Merchán',
      });
    const { accessToken } = signup.body as AuthResponseDto;

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        const user = res.body as UserDto;
        expect(user.username).toBe('ivan-merchan');
      });
  });

  it('/auth/me (GET) returns 401 without a token', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
