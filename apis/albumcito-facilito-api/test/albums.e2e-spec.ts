import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AlbumDetailDto } from './../src/albums/dto/album-detail.dto';
import { AlbumSummaryDto } from './../src/albums/dto/album-summary.dto';
import { StickerDto } from './../src/albums/dto/sticker.dto';

describe('AlbumsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/albums (GET) lists every album summary', () => {
    return request(app.getHttpServer())
      .get('/albums')
      .expect(200)
      .expect((res) => {
        const albums = res.body as AlbumSummaryDto[];
        expect(Array.isArray(albums)).toBe(true);
        expect(albums.length).toBeGreaterThan(0);
        expect(albums[0]).not.toHaveProperty('stickers');
      });
  });

  it('/albums/:albumId (GET) returns the album detail with its stickers', () => {
    return request(app.getHttpServer())
      .get('/albums/cody-aventuras')
      .expect(200)
      .expect((res) => {
        const album = res.body as AlbumDetailDto;
        expect(album.name).toBe('Cody Aventuras');
        expect(Array.isArray(album.stickers)).toBe(true);
        expect(album.stickers.length).toBeGreaterThan(0);
      });
  });

  it('/albums/:albumId (GET) returns 404 for an unknown album', () => {
    return request(app.getHttpServer())
      .get('/albums/does-not-exist')
      .expect(404);
  });

  it('/albums/:albumId/stickers (GET) returns the stickers of an album', () => {
    return request(app.getHttpServer())
      .get('/albums/cody-espacio/stickers')
      .expect(200)
      .expect((res) => {
        const stickers = res.body as StickerDto[];
        expect(Array.isArray(stickers)).toBe(true);
        expect(
          stickers.every((sticker) => sticker.name.startsWith('Cody')),
        ).toBe(true);
      });
  });
});
