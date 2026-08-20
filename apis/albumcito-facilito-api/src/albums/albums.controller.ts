import { Controller, Get, Param } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import {
  toAlbumDetailDto,
  toAlbumSummaryDto,
  toStickerDtoList,
} from './albums.mapper';
import { AlbumDetailDto } from './dto/album-detail.dto';
import { AlbumIdParamDto } from './dto/album-id.param.dto';
import { AlbumSummaryDto } from './dto/album-summary.dto';
import { StickerDto } from './dto/sticker.dto';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  findAll(): AlbumSummaryDto[] {
    return this.albumsService.findAll().map(toAlbumSummaryDto);
  }

  @Get(':albumId')
  findOne(@Param() { albumId }: AlbumIdParamDto): AlbumDetailDto {
    return toAlbumDetailDto(this.albumsService.findOne(albumId));
  }

  @Get(':albumId/stickers')
  findStickers(@Param() { albumId }: AlbumIdParamDto): StickerDto[] {
    return toStickerDtoList(this.albumsService.findStickers(albumId));
  }
}
