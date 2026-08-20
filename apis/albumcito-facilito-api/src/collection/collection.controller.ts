import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AlbumsService } from '../albums/albums.service';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { toCollectedStickerDto } from './collection.mapper';
import { CollectionService } from './collection.service';
import { AddStickerDto } from './dto/add-sticker.dto';
import { CollectedStickerDto } from './dto/collected-sticker.dto';
import { CollectedSticker } from './entities/collected-sticker.entity';

@Controller('me/stickers')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly albumsService: AlbumsService,
  ) {}

  @Post()
  async addSticker(
    @Req() request: AuthenticatedRequest,
    @Body() dto: AddStickerDto,
  ): Promise<CollectedStickerDto> {
    const collected = await this.collectionService.addSticker(
      request.user.sub,
      dto.stickerId,
    );
    return this.toDto(collected);
  }

  @Get()
  async findMine(
    @Req() request: AuthenticatedRequest,
  ): Promise<CollectedStickerDto[]> {
    const collected = await this.collectionService.findByUser(request.user.sub);
    return collected.map((item) => this.toDto(item));
  }

  private toDto(collected: CollectedSticker): CollectedStickerDto {
    const { album, sticker } = this.albumsService.findStickerById(
      collected.stickerId,
    );
    return toCollectedStickerDto(collected, { album, sticker });
  }
}
