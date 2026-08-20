import { Expose } from 'class-transformer';
import { StickerRarity, StickerStatus } from '../entities/album.entity';

export class StickerDto {
  @Expose()
  id: string;

  @Expose()
  number: number;

  @Expose()
  name: string;

  @Expose()
  rarity: StickerRarity;

  @Expose()
  status: StickerStatus;
}
