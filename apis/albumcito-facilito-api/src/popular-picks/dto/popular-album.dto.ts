import { Expose } from 'class-transformer';

export class PopularAlbumDto {
  @Expose()
  albumId: string;

  @Expose()
  name: string;

  @Expose()
  coverEmoji: string;

  @Expose()
  collectedCount: number;
}
