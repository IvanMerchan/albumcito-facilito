import { Injectable, NotFoundException } from '@nestjs/common';
import { ALBUMS } from './albums.data';
import { Album, Sticker } from './entities/album.entity';

@Injectable()
export class AlbumsService {
  findAll(): Album[] {
    return [...ALBUMS];
  }

  findOne(albumId: string): Album {
    const album = ALBUMS.find((candidate) => candidate.id === albumId);
    if (!album) {
      throw new NotFoundException(`Album "${albumId}" not found`);
    }
    return album;
  }

  findStickers(albumId: string): Sticker[] {
    return this.findOne(albumId).stickers;
  }

  findStickerById(stickerId: string): { album: Album; sticker: Sticker } {
    for (const album of ALBUMS) {
      const sticker = album.stickers.find(
        (candidate) => candidate.id === stickerId,
      );
      if (sticker) {
        return { album, sticker };
      }
    }
    throw new NotFoundException(`Sticker "${stickerId}" not found`);
  }
}
