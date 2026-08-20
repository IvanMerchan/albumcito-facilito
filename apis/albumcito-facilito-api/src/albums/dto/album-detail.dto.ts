import { Expose, Type } from 'class-transformer';
import { StickerDto } from './sticker.dto';

export class AlbumDetailDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  coverEmoji: string;

  @Expose()
  totalStickers: number;

  @Expose()
  ownedStickers: number;

  @Expose()
  @Type(() => StickerDto)
  stickers: StickerDto[];
}
