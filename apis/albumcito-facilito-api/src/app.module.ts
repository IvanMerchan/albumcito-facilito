import { Module } from '@nestjs/common';
import { AlbumsModule } from './albums/albums.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CollectionModule } from './collection/collection.module';
import { PopularPicksModule } from './popular-picks/popular-picks.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AlbumsModule,
    AuthModule,
    CollectionModule,
    PopularPicksModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
