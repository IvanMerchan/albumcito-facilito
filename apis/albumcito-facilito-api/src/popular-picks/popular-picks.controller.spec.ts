import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { CollectionService } from '../collection/collection.service';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { PopularPicksController } from './popular-picks.controller';
import { PopularPicksService } from './popular-picks.service';

describe('PopularPicksController', () => {
  let controller: PopularPicksController;
  let collectionService: CollectionService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopularPicksController],
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

    controller = module.get<PopularPicksController>(PopularPicksController);
    collectionService = module.get<CollectionService>(CollectionService);
    authService = module.get<AuthService>(AuthService);
    await resetDatabase(module.get<PrismaService>(PrismaService));
  });

  it('returns popular albums mapped to DTOs, with no internal fields', async () => {
    const user = await authService.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });
    await collectionService.addSticker(user.id, 'cody-aventuras-01');

    const albums = await controller.findPopularAlbums();

    expect(albums).toHaveLength(1);
    expect(albums[0].albumId).toBe('cody-aventuras');
    expect(albums[0].name).toBe('Cody Aventuras');
    expect(albums[0].collectedCount).toBe(1);
    expect(albums[0]).not.toHaveProperty('stickers');
  });

  it('returns popular stickers mapped to DTOs, with no internal fields', async () => {
    const user = await authService.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });
    await collectionService.addSticker(user.id, 'cody-aventuras-01');

    const stickers = await controller.findPopularStickers();

    expect(stickers).toHaveLength(1);
    expect(stickers[0].stickerId).toBe('cody-aventuras-01');
    expect(stickers[0].albumId).toBe('cody-aventuras');
    expect(stickers[0].albumName).toBe('Cody Aventuras');
    expect(stickers[0].collectedCount).toBe(1);
    expect(stickers[0]).not.toHaveProperty('status');
  });

  it('returns empty arrays when nothing has been collected', async () => {
    expect(await controller.findPopularAlbums()).toEqual([]);
    expect(await controller.findPopularStickers()).toEqual([]);
  });
});
