import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import { PopularAlbumDto } from './../src/popular-picks/dto/popular-album.dto';
import { PopularStickerDto } from './../src/popular-picks/dto/popular-sticker.dto';
import { PrismaService } from './../src/prisma/prisma.service';
import { resetDatabase } from './../src/prisma/reset-database';

describe('PopularPicksController (e2e)', () => {
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

  async function signupAndCollect(
    email: string,
    stickerId: string,
  ): Promise<void> {
    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email,
        password: 'super-secret',
        name: 'Test User',
      });
    const { accessToken } = signup.body as AuthResponseDto;

    await request(app.getHttpServer())
      .post('/me/stickers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ stickerId });
  }

  it('/popular-picks/albums (GET) ranks albums by real collection counts, without a token', async () => {
    await signupAndCollect('user1@example.com', 'cody-aventuras-01');
    await signupAndCollect('user2@example.com', 'cody-aventuras-02');
    await signupAndCollect('user3@example.com', 'cody-espacio-01');

    return request(app.getHttpServer())
      .get('/popular-picks/albums')
      .expect(200)
      .expect((res) => {
        const body = res.body as PopularAlbumDto[];
        expect(body.map((album) => album.albumId)).toEqual([
          'cody-aventuras',
          'cody-espacio',
        ]);
        expect(body[0].collectedCount).toBe(2);
      });
  });

  it('/popular-picks/stickers (GET) ranks stickers by real collection counts, without a token', async () => {
    await signupAndCollect('user1@example.com', 'cody-aventuras-01');
    await signupAndCollect('user2@example.com', 'cody-aventuras-01');
    await signupAndCollect('user3@example.com', 'cody-aventuras-02');

    return request(app.getHttpServer())
      .get('/popular-picks/stickers')
      .expect(200)
      .expect((res) => {
        const body = res.body as PopularStickerDto[];
        expect(body[0]).toMatchObject({
          stickerId: 'cody-aventuras-01',
          albumId: 'cody-aventuras',
          collectedCount: 2,
        });
      });
  });

  it('/popular-picks/albums and /popular-picks/stickers (GET) return empty arrays on a fresh database', async () => {
    await request(app.getHttpServer())
      .get('/popular-picks/albums')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([]);
      });

    return request(app.getHttpServer())
      .get('/popular-picks/stickers')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([]);
      });
  });
});
