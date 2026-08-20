import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { CollectionService } from './collection.service';

describe('CollectionService', () => {
  let service: CollectionService;
  let authService: AuthService;
  let prisma: PrismaService;
  let userId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        AlbumsService,
        AuthService,
        PrismaService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    await resetDatabase(prisma);

    const user = await authService.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });
    userId = user.id;
  });

  it('adds a sticker to the collection', async () => {
    const collected = await service.addSticker(userId, 'cody-aventuras-01');
    expect(collected.stickerId).toBe('cody-aventuras-01');
    expect(collected.userId).toBe(userId);
  });

  it('marks onboarding as completed on the first sticker', async () => {
    await service.addSticker(userId, 'cody-aventuras-01');
    const user = await authService.findById(userId);
    expect(user.onboardingCompleted).toBe(true);
  });

  it('is idempotent when the same sticker is added twice', async () => {
    await service.addSticker(userId, 'cody-aventuras-01');
    await service.addSticker(userId, 'cody-aventuras-01');

    const stickers = await service.findByUser(userId);
    expect(stickers).toHaveLength(1);
  });

  it('throws NotFoundException for an unknown sticker id', async () => {
    await expect(service.addSticker(userId, 'does-not-exist')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lists the stickers collected by a user', async () => {
    await service.addSticker(userId, 'cody-aventuras-01');
    await service.addSticker(userId, 'cody-aventuras-02');

    const stickers = await service.findByUser(userId);
    expect(stickers.map((sticker) => sticker.stickerId)).toEqual([
      'cody-aventuras-01',
      'cody-aventuras-02',
    ]);
  });
});
