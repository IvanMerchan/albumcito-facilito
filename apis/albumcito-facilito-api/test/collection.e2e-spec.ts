import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import { CollectedStickerDto } from './../src/collection/dto/collected-sticker.dto';
import { PrismaService } from './../src/prisma/prisma.service';
import { resetDatabase } from './../src/prisma/reset-database';

describe('CollectionController (e2e)', () => {
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

  async function signup(): Promise<string> {
    const res = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });
    return (res.body as AuthResponseDto).accessToken;
  }

  it('/me/stickers (POST) adds a sticker and completes onboarding', async () => {
    const token = await signup();

    await request(app.getHttpServer())
      .post('/me/stickers')
      .set('Authorization', `Bearer ${token}`)
      .send({ stickerId: 'cody-aventuras-01' })
      .expect(201)
      .expect((res) => {
        const body = res.body as CollectedStickerDto;
        expect(body.stickerId).toBe('cody-aventuras-01');
        expect(body.albumId).toBe('cody-aventuras');
      });

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/me/stickers (POST) returns 404 for an unknown sticker', async () => {
    const token = await signup();

    return request(app.getHttpServer())
      .post('/me/stickers')
      .set('Authorization', `Bearer ${token}`)
      .send({ stickerId: 'does-not-exist' })
      .expect(404);
  });

  it('/me/stickers (POST) returns 401 without a token', () => {
    return request(app.getHttpServer())
      .post('/me/stickers')
      .send({ stickerId: 'cody-aventuras-01' })
      .expect(401);
  });

  it('/me/stickers (GET) lists the stickers collected by the current user', async () => {
    const token = await signup();
    await request(app.getHttpServer())
      .post('/me/stickers')
      .set('Authorization', `Bearer ${token}`)
      .send({ stickerId: 'cody-aventuras-01' });

    return request(app.getHttpServer())
      .get('/me/stickers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as CollectedStickerDto[];
        expect(body).toHaveLength(1);
        expect(body[0].stickerId).toBe('cody-aventuras-01');
      });
  });
});
