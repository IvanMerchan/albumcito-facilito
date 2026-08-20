import { Module } from '@nestjs/common';
import { AlbumsModule } from './albums/albums.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CollectionModule } from './collection/collection.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AlbumsModule, AuthModule, CollectionModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
