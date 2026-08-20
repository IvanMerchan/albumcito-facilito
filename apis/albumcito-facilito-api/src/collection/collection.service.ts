import { Injectable, Logger } from '@nestjs/common';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CollectedSticker } from './entities/collected-sticker.entity';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly albumsService: AlbumsService,
    private readonly authService: AuthService,
  ) {}

  async addSticker(
    userId: string,
    stickerId: string,
  ): Promise<CollectedSticker> {
    // Throws NotFoundException if the sticker doesn't exist in the seed.
    this.albumsService.findStickerById(stickerId);
    const user = await this.authService.findById(userId);

    const existing = await this.prisma.collectedSticker.findUnique({
      where: { userId_stickerId: { userId, stickerId } },
    });
    if (existing) {
      return existing;
    }

    const collected = await this.prisma.collectedSticker.create({
      data: { userId, stickerId },
    });

    if (!user.onboardingCompleted) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      });

      const durationMs =
        collected.collectedAt.getTime() - user.createdAt.getTime();
      this.logger.log(
        JSON.stringify({
          event: 'onboarding_completed',
          userId,
          signupAt: user.createdAt.toISOString(),
          completedAt: collected.collectedAt.toISOString(),
          durationMs,
        }),
      );
    }

    return collected;
  }

  findByUser(userId: string): Promise<CollectedSticker[]> {
    return this.prisma.collectedSticker.findMany({
      where: { userId },
      orderBy: { collectedAt: 'asc' },
    });
  }
}
