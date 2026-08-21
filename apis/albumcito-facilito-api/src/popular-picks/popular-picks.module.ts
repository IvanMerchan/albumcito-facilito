import { Module } from '@nestjs/common';
import { AlbumsModule } from '../albums/albums.module';
import { PopularPicksController } from './popular-picks.controller';
import { PopularPicksService } from './popular-picks.service';

@Module({
  imports: [AlbumsModule],
  controllers: [PopularPicksController],
  providers: [PopularPicksService],
})
export class PopularPicksModule {}
