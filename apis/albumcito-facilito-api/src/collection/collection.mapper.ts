import { plainToInstance } from 'class-transformer';
import { Album, Sticker } from '../albums/entities/album.entity';
import { CollectedStickerDto } from './dto/collected-sticker.dto';
import { CollectedSticker } from './entities/collected-sticker.entity';

export function toCollectedStickerDto(
  collected: CollectedSticker,
  context: { album: Album; sticker: Sticker },
): CollectedStickerDto {
  return plainToInstance(
    CollectedStickerDto,
    {
      stickerId: collected.stickerId,
      albumId: context.album.id,
      stickerName: context.sticker.name,
      collectedAt: collected.collectedAt,
    },
    { excludeExtraneousValues: true },
  );
}
