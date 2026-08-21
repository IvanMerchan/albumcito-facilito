import { plainToInstance } from 'class-transformer';
import { PopularAlbumDto } from './dto/popular-album.dto';
import { PopularStickerDto } from './dto/popular-sticker.dto';
import { PopularAlbum, PopularSticker } from './popular-picks.service';

export function toPopularAlbumDto(album: PopularAlbum): PopularAlbumDto {
  return plainToInstance(PopularAlbumDto, album, {
    excludeExtraneousValues: true,
  });
}

export function toPopularStickerDto(
  sticker: PopularSticker,
): PopularStickerDto {
  return plainToInstance(PopularStickerDto, sticker, {
    excludeExtraneousValues: true,
  });
}
