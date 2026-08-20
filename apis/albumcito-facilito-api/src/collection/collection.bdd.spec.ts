import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectedStickerDto } from './dto/collected-sticker.dto';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';

const feature = loadFeature('./collection.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let controller: CollectionController;
  let authService: AuthService;
  let request: AuthenticatedRequest;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
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

    controller = app.get<CollectionController>(CollectionController);
    authService = app.get<AuthService>(AuthService);
    await resetDatabase(app.get<PrismaService>(PrismaService));
  });

  test('Adding a valid sticker', ({ given, when, then, and }) => {
    let result: CollectedStickerDto;

    given('I am signed up', async () => {
      const user = await authService.signup({
        email: 'ivan.merchan@gmail.com',
        password: 'super-secret',
        name: 'Iván Merchán',
      });
      request = {
        user: { sub: user.id, email: user.email, username: user.username },
      } as unknown as AuthenticatedRequest;
    });

    when('I add the sticker "cody-aventuras-01" to my collection', async () => {
      result = await controller.addSticker(request, {
        stickerId: 'cody-aventuras-01',
      });
    });

    then('the sticker appears in my collection', () => {
      expect(result.stickerId).toBe('cody-aventuras-01');
    });

    and('my onboarding is marked as completed', async () => {
      const user = await authService.findById(request.user.sub);
      expect(user.onboardingCompleted).toBe(true);
    });
  });

  test('Adding a sticker that does not exist', ({ given, when, then }) => {
    let error: unknown;

    given('I am signed up', async () => {
      const user = await authService.signup({
        email: 'ivan.merchan@gmail.com',
        password: 'super-secret',
        name: 'Iván Merchán',
      });
      request = {
        user: { sub: user.id, email: user.email, username: user.username },
      } as unknown as AuthenticatedRequest;
    });

    when(
      'I try to add the sticker "does-not-exist" to my collection',
      async () => {
        try {
          await controller.addSticker(request, { stickerId: 'does-not-exist' });
        } catch (caught) {
          error = caught;
        }
      },
    );

    then('I receive a not found error', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Adding the same sticker twice', ({ given, and, when, then }) => {
    given('I am signed up', async () => {
      const user = await authService.signup({
        email: 'ivan.merchan@gmail.com',
        password: 'super-secret',
        name: 'Iván Merchán',
      });
      request = {
        user: { sub: user.id, email: user.email, username: user.username },
      } as unknown as AuthenticatedRequest;
    });

    and(
      'I already added the sticker "cody-aventuras-01" to my collection',
      async () => {
        await controller.addSticker(request, {
          stickerId: 'cody-aventuras-01',
        });
      },
    );

    when(
      'I add the sticker "cody-aventuras-01" to my collection again',
      async () => {
        await controller.addSticker(request, {
          stickerId: 'cody-aventuras-01',
        });
      },
    );

    then('my collection still has exactly one sticker', async () => {
      const stickers = await controller.findMine(request);
      expect(stickers).toHaveLength(1);
    });
  });
});
