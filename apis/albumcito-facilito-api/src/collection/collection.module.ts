import { Module } from '@nestjs/common';
import { AlbumsModule } from '../albums/albums.module';
import { AuthModule } from '../auth/auth.module';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

@Module({
  imports: [AlbumsModule, AuthModule],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
