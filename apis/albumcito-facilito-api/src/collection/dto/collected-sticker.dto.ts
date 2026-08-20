import { Expose } from 'class-transformer';

export class CollectedStickerDto {
  @Expose()
  stickerId: string;

  @Expose()
  albumId: string;

  @Expose()
  stickerName: string;

  @Expose()
  collectedAt: Date;
}
