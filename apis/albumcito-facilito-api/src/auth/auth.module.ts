import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const jwtModule = JwtModule.register({
  // Dev-only fallback so the API runs without extra setup. Production
  // deployments must set JWT_SECRET.
  secret: process.env.JWT_SECRET ?? 'albumcito-facilito-dev-secret',
  signOptions: { expiresIn: '7d' },
});

@Module({
  imports: [jwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  // JwtModule is re-exported (not just JwtAuthGuard) because Nest resolves
  // @UseGuards(JwtAuthGuard) in the consuming module's own injector context,
  // which needs JwtService (JwtAuthGuard's dependency) visible too -- see
  // CollectionModule, the first module outside auth to use this guard.
  exports: [AuthService, JwtAuthGuard, jwtModule],
})
export class AuthModule {}
