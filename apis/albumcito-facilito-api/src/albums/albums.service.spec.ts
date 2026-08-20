import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from './albums.service';

describe('AlbumsService', () => {
  let service: AlbumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlbumsService],
    }).compile();

    service = module.get<AlbumsService>(AlbumsService);
  });

  it('lists every seeded album', () => {
    const albums = service.findAll();
    expect(albums.length).toBeGreaterThan(0);
    expect(albums.every((album) => album.stickers.length > 0)).toBe(true);
  });

  it('finds an album by id', () => {
    const album = service.findOne('cody-aventuras');
    expect(album.name).toBe('Cody Aventuras');
  });

  it('throws NotFoundException for an unknown album id', () => {
    expect(() => service.findOne('does-not-exist')).toThrow(NotFoundException);
  });

  it('returns the stickers of an album', () => {
    const stickers = service.findStickers('cody-espacio');
    expect(stickers.every((sticker) => sticker.name.startsWith('Cody'))).toBe(
      true,
    );
  });

  it('throws NotFoundException when requesting stickers of an unknown album', () => {
    expect(() => service.findStickers('does-not-exist')).toThrow(
      NotFoundException,
    );
  });

  it('finds a sticker by id along with its parent album', () => {
    const { album, sticker } = service.findStickerById('cody-aventuras-01');
    expect(album.id).toBe('cody-aventuras');
    expect(sticker.id).toBe('cody-aventuras-01');
  });

  it('throws NotFoundException for an unknown sticker id', () => {
    expect(() => service.findStickerById('does-not-exist')).toThrow(
      NotFoundException,
    );
  });
});
