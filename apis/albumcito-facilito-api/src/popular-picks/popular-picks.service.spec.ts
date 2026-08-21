import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { CollectionService } from '../collection/collection.service';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { PopularPicksService } from './popular-picks.service';

describe('PopularPicksService', () => {
  let popularPicksService: PopularPicksService;
  let collectionService: CollectionService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopularPicksService,
        CollectionService,
        AlbumsService,
        AuthService,
        PrismaService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    popularPicksService = module.get<PopularPicksService>(PopularPicksService);
    collectionService = module.get<CollectionService>(CollectionService);
    authService = module.get<AuthService>(AuthService);
    await resetDatabase(module.get<PrismaService>(PrismaService));
  });

  async function signupUser(email: string): Promise<string> {
    const user = await authService.signup({
      email,
      password: 'super-secret',
      name: 'Test User',
    });
    return user.id;
  }

  it('returns empty lists when no stickers have been collected', async () => {
    expect(await popularPicksService.getPopularAlbums()).toEqual([]);
    expect(await popularPicksService.getPopularStickers()).toEqual([]);
  });

  it('ranks albums by total collected stickers across all users', async () => {
    const user1 = await signupUser('user1@example.com');
    const user2 = await signupUser('user2@example.com');

    // cody-aventuras: 2 collected stickers total, cody-espacio: 1
    await collectionService.addSticker(user1, 'cody-aventuras-01');
    await collectionService.addSticker(user2, 'cody-aventuras-02');
    await collectionService.addSticker(user1, 'cody-espacio-01');

    const albums = await popularPicksService.getPopularAlbums();

    expect(albums.map((album) => album.albumId)).toEqual([
      'cody-aventuras',
      'cody-espacio',
    ]);
    expect(albums[0].collectedCount).toBe(2);
    expect(albums[1].collectedCount).toBe(1);
  });

  it('breaks tied album counts by catalog order', async () => {
    const user1 = await signupUser('user1@example.com');

    // cody-espacio and cody-oceano each get exactly 1 collected sticker
    await collectionService.addSticker(user1, 'cody-espacio-01');
    await collectionService.addSticker(user1, 'cody-oceano-01');

    const albums = await popularPicksService.getPopularAlbums();

    expect(albums.map((album) => album.albumId)).toEqual([
      'cody-espacio',
      'cody-oceano',
    ]);
  });

  it('ranks stickers by times collected across all users, with their parent album', async () => {
    const user1 = await signupUser('user1@example.com');
    const user2 = await signupUser('user2@example.com');

    await collectionService.addSticker(user1, 'cody-aventuras-01');
    await collectionService.addSticker(user2, 'cody-aventuras-01');
    await collectionService.addSticker(user1, 'cody-aventuras-02');

    const stickers = await popularPicksService.getPopularStickers();

    expect(stickers[0]).toMatchObject({
      stickerId: 'cody-aventuras-01',
      albumId: 'cody-aventuras',
      collectedCount: 2,
    });
    expect(stickers[1]).toMatchObject({
      stickerId: 'cody-aventuras-02',
      collectedCount: 1,
    });
  });

  it('breaks tied sticker counts by catalog order', async () => {
    const user1 = await signupUser('user1@example.com');
    const user2 = await signupUser('user2@example.com');

    await collectionService.addSticker(user1, 'cody-espacio-02');
    await collectionService.addSticker(user2, 'cody-espacio-02');
    await collectionService.addSticker(user1, 'cody-espacio-01');
    await collectionService.addSticker(user2, 'cody-espacio-01');

    const stickers = await popularPicksService.getPopularStickers();

    expect(stickers.map((sticker) => sticker.stickerId)).toEqual([
      'cody-espacio-01',
      'cody-espacio-02',
    ]);
  });

  it('limits results to the top 5', async () => {
    const user = await signupUser('user1@example.com');
    const stickerIds = Array.from(
      { length: 6 },
      (_, index) => `cody-aventuras-0${index + 1}`,
    );

    for (const stickerId of stickerIds) {
      await collectionService.addSticker(user, stickerId);
    }

    const stickers = await popularPicksService.getPopularStickers();
    expect(stickers).toHaveLength(5);
  });
});
