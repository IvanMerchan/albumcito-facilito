import { Expose } from 'class-transformer';
import { StickerRarity } from '../../albums/entities/album.entity';

export class PopularStickerDto {
  @Expose()
  stickerId: string;

  @Expose()
  stickerName: string;

  @Expose()
  rarity: StickerRarity;

  @Expose()
  albumId: string;

  @Expose()
  albumName: string;

  @Expose()
  collectedCount: number;
}
