import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';

describe('AlbumsController', () => {
  let controller: AlbumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [AlbumsService],
    }).compile();

    controller = module.get<AlbumsController>(AlbumsController);
  });

  it('returns a summary for every album, without the sticker list', () => {
    const albums = controller.findAll();
    expect(albums.length).toBeGreaterThan(0);
    expect(albums[0]).not.toHaveProperty('stickers');
    expect(typeof albums[0].totalStickers).toBe('number');
  });

  it('returns the detail of one album including its stickers', () => {
    const album = controller.findOne({ albumId: 'cody-aventuras' });
    expect(album.name).toBe('Cody Aventuras');
    expect(album.stickers.length).toBe(album.totalStickers);
  });

  it('throws NotFoundException for an unknown album id', () => {
    expect(() => controller.findOne({ albumId: 'does-not-exist' })).toThrow(
      NotFoundException,
    );
  });

  it('returns the stickers of an album', () => {
    const stickers = controller.findStickers({ albumId: 'cody-oceano' });
    expect(stickers.length).toBeGreaterThan(0);
  });
});
