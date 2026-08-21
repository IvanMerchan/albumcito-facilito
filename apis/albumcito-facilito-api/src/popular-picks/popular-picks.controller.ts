import { Controller, Get } from '@nestjs/common';
import { toPopularAlbumDto, toPopularStickerDto } from './popular-picks.mapper';
import { PopularPicksService } from './popular-picks.service';
import { PopularAlbumDto } from './dto/popular-album.dto';
import { PopularStickerDto } from './dto/popular-sticker.dto';

// Public: no @UseGuards. Popular picks are as public as the album catalog
// itself (GET /albums), per the spec's "Public access" requirement.
@Controller('popular-picks')
export class PopularPicksController {
  constructor(private readonly popularPicksService: PopularPicksService) {}

  @Get('albums')
  async findPopularAlbums(): Promise<PopularAlbumDto[]> {
    const albums = await this.popularPicksService.getPopularAlbums();
    return albums.map(toPopularAlbumDto);
  }

  @Get('stickers')
  async findPopularStickers(): Promise<PopularStickerDto[]> {
    const stickers = await this.popularPicksService.getPopularStickers();
    return stickers.map(toPopularStickerDto);
  }
}
