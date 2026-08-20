import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { resetUsers } from './auth.data';
import { AuthenticatedRequest } from './jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    resetUsers();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
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

    const me = controller.me(request);
    expect(me.username).toBe('ivan-merchan');
  });
});
