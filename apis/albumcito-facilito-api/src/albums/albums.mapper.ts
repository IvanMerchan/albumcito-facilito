import { plainToInstance } from 'class-transformer';
import { AlbumDetailDto } from './dto/album-detail.dto';
import { AlbumSummaryDto } from './dto/album-summary.dto';
import { StickerDto } from './dto/sticker.dto';
import { Album, Sticker } from './entities/album.entity';

function countOwned(stickers: readonly Sticker[]): number {
  return stickers.filter((sticker) => sticker.status === 'owned').length;
}

export function toAlbumSummaryDto(album: Album): AlbumSummaryDto {
  return plainToInstance(
    AlbumSummaryDto,
    {
      id: album.id,
      name: album.name,
      description: album.description,
      coverEmoji: album.coverEmoji,
      totalStickers: album.stickers.length,
      ownedStickers: countOwned(album.stickers),
    },
    { excludeExtraneousValues: true },
  );
}

export function toAlbumDetailDto(album: Album): AlbumDetailDto {
  return plainToInstance(
    AlbumDetailDto,
    {
      id: album.id,
      name: album.name,
      description: album.description,
      coverEmoji: album.coverEmoji,
      totalStickers: album.stickers.length,
      ownedStickers: countOwned(album.stickers),
      stickers: album.stickers,
    },
    { excludeExtraneousValues: true },
  );
}

export function toStickerDtoList(stickers: readonly Sticker[]): StickerDto[] {
  return plainToInstance(StickerDto, [...stickers], {
    excludeExtraneousValues: true,
  });
}
