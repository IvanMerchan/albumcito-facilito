import { Expose } from 'class-transformer';

export class AlbumSummaryDto {
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
}
