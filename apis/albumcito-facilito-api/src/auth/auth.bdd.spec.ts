import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { resetUsers } from './auth.data';
import { AuthResponseDto } from './dto/auth-response.dto';

const feature = loadFeature('./auth.feature', { loadRelativePath: true });

defineFeature(feature, (test) => {
  let controller: AuthController;

  beforeEach(async () => {
    resetUsers();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    controller = app.get<AuthController>(AuthController);
  });

  test('Signing up with a new email', ({ given, when, then }) => {
    let response: AuthResponseDto;

    given('no account is registered for "ivan.merchan@gmail.com"', () => {
      // resetUsers() in beforeEach already guarantees this
    });

    when(
      'I sign up with email "ivan.merchan@gmail.com", password "super-secret" and name "Iván Merchán"',
      async () => {
        response = await controller.signup({
          email: 'ivan.merchan@gmail.com',
          password: 'super-secret',
          name: 'Iván Merchán',
        });
      },
    );

    then('I receive an access token for username "ivan-merchan"', () => {
      expect(response.user.username).toBe('ivan-merchan');
      expect(typeof response.accessToken).toBe('string');
    });
  });

  test('Signing up with an email that is already registered', ({
    given,
    when,
    then,
  }) => {
    let error: unknown;

    given(
      'an account already exists for "ivan.merchan@gmail.com"',
      async () => {
        await controller.signup({
          email: 'ivan.merchan@gmail.com',
          password: 'super-secret',
          name: 'Iván Merchán',
        });
      },
    );

    when('I sign up again with email "ivan.merchan@gmail.com"', async () => {
      try {
        await controller.signup({
          email: 'ivan.merchan@gmail.com',
          password: 'another-secret',
          name: 'Otro Nombre',
        });
      } catch (caught) {
        error = caught;
      }
    });

    then('I receive an email already registered error', () => {
      expect(error).toBeInstanceOf(ConflictException);
    });
  });

  test('Logging in with the correct password', ({ given, when, then }) => {
    let response: AuthResponseDto;

    given(
      'an account already exists for "ivan.merchan@gmail.com" with password "super-secret"',
      async () => {
        await controller.signup({
          email: 'ivan.merchan@gmail.com',
          password: 'super-secret',
          name: 'Iván Merchán',
        });
      },
    );

    when(
      'I log in with email "ivan.merchan@gmail.com" and password "super-secret"',
      async () => {
        response = await controller.login({
          email: 'ivan.merchan@gmail.com',
          password: 'super-secret',
        });
      },
    );

    then('I receive an access token for username "ivan-merchan"', () => {
      expect(response.user.username).toBe('ivan-merchan');
      expect(typeof response.accessToken).toBe('string');
    });
  });

  test('Logging in with the wrong password', ({ given, when, then }) => {
    let error: unknown;

    given(
      'an account already exists for "ivan.merchan@gmail.com" with password "super-secret"',
      async () => {
        await controller.signup({
          email: 'ivan.merchan@gmail.com',
          password: 'super-secret',
          name: 'Iván Merchán',
        });
      },
    );

    when(
      'I log in with email "ivan.merchan@gmail.com" and password "wrong-password"',
      async () => {
        try {
          await controller.login({
            email: 'ivan.merchan@gmail.com',
            password: 'wrong-password',
          });
        } catch (caught) {
          error = caught;
        }
      },
    );

    then('I receive an invalid credentials error', () => {
      expect(error).toBeInstanceOf(UnauthorizedException);
    });
  });
});
