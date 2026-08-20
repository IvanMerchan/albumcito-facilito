import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    await resetDatabase(module.get<PrismaService>(PrismaService));
  });

  it('registers a user and returns an access token', async () => {
    const response = await controller.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    expect(response.user.username).toBe('ivan-merchan');
    expect(typeof response.accessToken).toBe('string');
    expect(response.user).not.toHaveProperty('passwordHash');
  });

  it('logs a registered user in', async () => {
    await controller.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    const response = await controller.login({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
    });

    expect(response.user.email).toBe('ivan.merchan@gmail.com');
  });

  it('throws UnauthorizedException for a wrong password', async () => {
    await controller.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    await expect(
      controller.login({
        email: 'ivan.merchan@gmail.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns the current user for a valid token', async () => {
    const signup = await controller.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    const request = {
      user: {
        sub: signup.user.id,
        email: signup.user.email,
        username: signup.user.username,
      },
    } as unknown as AuthenticatedRequest;

    const me = await controller.me(request);
    expect(me.username).toBe('ivan-merchan');
  });
});
