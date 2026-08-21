import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { CollectionService } from '../collection/collection.service';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { PopularAlbumDto } from './dto/popular-album.dto';
import { PopularStickerDto } from './dto/popular-sticker.dto';
import { PopularPicksController } from './popular-picks.controller';
import { PopularPicksService } from './popular-picks.service';

const feature = loadFeature('./popular-picks.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let controller: PopularPicksController;
  let collectionService: CollectionService;
  let authService: AuthService;
  let nextUserSuffix: number;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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

    controller = app.get<PopularPicksController>(PopularPicksController);
    collectionService = app.get<CollectionService>(CollectionService);
    authService = app.get<AuthService>(AuthService);
    await resetDatabase(app.get<PrismaService>(PrismaService));
    nextUserSuffix = 1;
  });

  async function collectAsNewUser(stickerId: string): Promise<void> {
    const user = await authService.signup({
      email: `user${nextUserSuffix}@example.com`,
      password: 'super-secret',
      name: 'Test User',
    });
    nextUserSuffix += 1;
    await collectionService.addSticker(user.id, stickerId);
  }

  test('Albums ranked by real collection counts', ({ given, when, then }) => {
    let albums: PopularAlbumDto[];

    given(
      '"cody-aventuras" has been collected twice and "cody-espacio" once',
      async () => {
        await collectAsNewUser('cody-aventuras-01');
        await collectAsNewUser('cody-aventuras-02');
        await collectAsNewUser('cody-espacio-01');
      },
    );

    when('I request the popular albums', async () => {
      albums = await controller.findPopularAlbums();
    });

    then('I see "cody-aventuras" ranked above "cody-espacio"', () => {
      expect(albums.map((album) => album.albumId)).toEqual([
        'cody-aventuras',
        'cody-espacio',
      ]);
    });
  });

  test('Tied album counts break by catalog order', ({ given, when, then }) => {
    let albums: PopularAlbumDto[];

    given(
      '"cody-espacio" and "cody-oceano" have each been collected once',
      async () => {
        await collectAsNewUser('cody-espacio-01');
        await collectAsNewUser('cody-oceano-01');
      },
    );

    when('I request the popular albums', async () => {
      albums = await controller.findPopularAlbums();
    });

    then('I see "cody-espacio" ranked above "cody-oceano"', () => {
      expect(albums.map((album) => album.albumId)).toEqual([
        'cody-espacio',
        'cody-oceano',
      ]);
    });
  });

  test('Stickers ranked by real collection counts', ({ given, when, then }) => {
    let stickers: PopularStickerDto[];

    given(
      'the sticker "cody-aventuras-01" has been collected twice and "cody-aventuras-02" once',
      async () => {
        await collectAsNewUser('cody-aventuras-01');
        await collectAsNewUser('cody-aventuras-01');
        await collectAsNewUser('cody-aventuras-02');
      },
    );

    when('I request the popular stickers', async () => {
      stickers = await controller.findPopularStickers();
    });

    then('I see "cody-aventuras-01" ranked above "cody-aventuras-02"', () => {
      expect(stickers.map((sticker) => sticker.stickerId)).toEqual([
        'cody-aventuras-01',
        'cody-aventuras-02',
      ]);
    });
  });

  test('No collection data yet', ({ given, when, then }) => {
    let albums: PopularAlbumDto[];
    let stickers: PopularStickerDto[];

    given('nobody has collected any sticker', () => {
      // resetDatabase() in beforeEach already guarantees this
    });

    when('I request the popular albums and the popular stickers', async () => {
      albums = await controller.findPopularAlbums();
      stickers = await controller.findPopularStickers();
    });

    then('both lists are empty', () => {
      expect(albums).toEqual([]);
      expect(stickers).toEqual([]);
    });
  });
});
