import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      // Dev-only fallback so the API runs without extra setup. Production
      // deployments must set JWT_SECRET (there is no .env/@nestjs/config
      // wiring in this repo yet).
      secret: process.env.JWT_SECRET ?? 'albumcito-facilito-dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
