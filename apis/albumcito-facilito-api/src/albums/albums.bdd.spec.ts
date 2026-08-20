import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AlbumSummaryDto } from './dto/album-summary.dto';
import { AlbumDetailDto } from './dto/album-detail.dto';
import { ALBUMS } from './albums.data';

const feature = loadFeature('./albums.feature', { loadRelativePath: true });

defineFeature(feature, (test) => {
  let controller: AlbumsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [AlbumsService],
    }).compile();

    controller = app.get<AlbumsController>(AlbumsController);
  });

  test('Listing the available albums', ({ given, when, then }) => {
    let albums: AlbumSummaryDto[];

    given('the albums API is ready', () => {
      // controller is already compiled in beforeEach
    });

    when('I request the list of albums', () => {
      albums = controller.findAll();
    });

    then('I receive a summary for each seeded album', () => {
      expect(albums).toHaveLength(ALBUMS.length);
    });
  });

  test('Opening an album shows its Cody stickers', ({ given, when, then }) => {
    let album: AlbumDetailDto;

    given('the albums API is ready', () => {
      // controller is already compiled in beforeEach
    });

    when('I request the album "cody-aventuras"', () => {
      album = controller.findOne({ albumId: 'cody-aventuras' });
    });

    then('I receive its details including every Cody sticker', () => {
      expect(album.name).toBe('Cody Aventuras');
      expect(
        album.stickers.every((sticker) => sticker.name.startsWith('Cody')),
      ).toBe(true);
    });
  });

  test('Requesting an album that does not exist', ({ given, when, then }) => {
    given('the albums API is ready', () => {
      // controller is already compiled in beforeEach
    });

    when('I request the album "does-not-exist"', () => {
      // exercised inside the assertion below
    });

    then('I receive a not found error', () => {
      expect(() => controller.findOne({ albumId: 'does-not-exist' })).toThrow(
        NotFoundException,
      );
    });
  });
});
