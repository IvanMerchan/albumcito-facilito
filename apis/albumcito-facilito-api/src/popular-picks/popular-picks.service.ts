import { Injectable } from '@nestjs/common';
import { AlbumsService } from '../albums/albums.service';
import { StickerRarity } from '../albums/entities/album.entity';
import { PrismaService } from '../prisma/prisma.service';

const TOP_N = 5;

export interface PopularAlbum {
  albumId: string;
  name: string;
  coverEmoji: string;
  collectedCount: number;
}

export interface PopularSticker {
  stickerId: string;
  stickerName: string;
  rarity: StickerRarity;
  albumId: string;
  albumName: string;
  collectedCount: number;
}

@Injectable()
export class PopularPicksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly albumsService: AlbumsService,
  ) {}

  // Both methods build their candidate list by walking the album catalog in
  // its existing order (not the DB group-by result order), then do a stable
  // sort by count -- that's what gives ties the "catalog order" tiebreak the
  // spec requires, for free, without a separate sort key.

  async getPopularAlbums(): Promise<PopularAlbum[]> {
    const countByStickerId = await this.countCollectedByStickerId();

    return this.albumsService
      .findAll()
      .map((album) => ({
        albumId: album.id,
        name: album.name,
        coverEmoji: album.coverEmoji,
        collectedCount: album.stickers.reduce(
          (sum, sticker) => sum + (countByStickerId.get(sticker.id) ?? 0),
          0,
        ),
      }))
      .filter((album) => album.collectedCount > 0)
      .sort((a, b) => b.collectedCount - a.collectedCount)
      .slice(0, TOP_N);
  }

  async getPopularStickers(): Promise<PopularSticker[]> {
    const countByStickerId = await this.countCollectedByStickerId();

    const items: PopularSticker[] = [];
    for (const album of this.albumsService.findAll()) {
      for (const sticker of album.stickers) {
        const collectedCount = countByStickerId.get(sticker.id);
        if (collectedCount) {
          items.push({
            stickerId: sticker.id,
            stickerName: sticker.name,
            rarity: sticker.rarity,
            albumId: album.id,
            albumName: album.name,
            collectedCount,
          });
        }
      }
    }

    return items
      .sort((a, b) => b.collectedCount - a.collectedCount)
      .slice(0, TOP_N);
  }

  private async countCollectedByStickerId(): Promise<Map<string, number>> {
    const counts = await this.prisma.collectedSticker.groupBy({
      by: ['stickerId'],
      _count: true,
    });
    return new Map(counts.map((row) => [row.stickerId, row._count]));
  }
}
