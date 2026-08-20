import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { resetDatabase } from '../prisma/reset-database';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    await resetDatabase(prisma);
  });

  it('registers a user and derives a username from the email', async () => {
    const user = await service.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    expect(user.username).toBe('ivan-merchan');
    expect(user.passwordHash).not.toBe('super-secret');
  });

  it('starts a new account with onboarding not completed', async () => {
    const user = await service.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    expect(user.onboardingCompleted).toBe(false);
  });

  it('adds a numeric suffix when the derived username is taken', async () => {
    await service.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });
    const second = await service.signup({
      email: 'ivan-merchan@work.com',
      password: 'super-secret',
      name: 'Iván Merchán Otro',
    });

    expect(second.username).toBe('ivan-merchan-2');
  });

  it('throws ConflictException when the email is already registered', async () => {
    await service.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    await expect(
      service.signup({
        email: 'ivan.merchan@gmail.com',
        password: 'another-secret',
        name: 'Otro Nombre',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('validates correct credentials', async () => {
    await service.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    const user = await service.validateUser({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
    });

    expect(user.email).toBe('ivan.merchan@gmail.com');
  });

  it('throws UnauthorizedException for a wrong password', async () => {
    await service.signup({
      email: 'ivan.merchan@gmail.com',
      password: 'super-secret',
      name: 'Iván Merchán',
    });

    await expect(
      service.validateUser({
        email: 'ivan.merchan@gmail.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for an unknown email', async () => {
    await expect(
      service.validateUser({
        email: 'does-not-exist@gmail.com',
        password: 'super-secret',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
