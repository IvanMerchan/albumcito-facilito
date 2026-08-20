import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from '../albums/albums.service';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

describe('CollectionController', () => {
  let controller: CollectionController;
  let request: AuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    controller = module.get<CollectionController>(CollectionController);
    await resetDatabase(module.get<PrismaService>(PrismaService));

    const authService = module.get<AuthService>(AuthService);
    const user = await authService.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });
    request = {
      user: { sub: user.id, email: user.email, username: user.username },
    } as unknown as AuthenticatedRequest;
  });

  it('adds a sticker and returns it with its album context', async () => {
    const result = await controller.addSticker(request, {
      stickerId: 'cody-aventuras-01',
    });

    expect(result.stickerId).toBe('cody-aventuras-01');
    expect(result.albumId).toBe('cody-aventuras');
    expect(result.stickerName).toBeTruthy();
  });

  it('lists the stickers collected by the current user', async () => {
    await controller.addSticker(request, { stickerId: 'cody-aventuras-01' });

    const stickers = await controller.findMine(request);
    expect(stickers).toHaveLength(1);
  });
});
