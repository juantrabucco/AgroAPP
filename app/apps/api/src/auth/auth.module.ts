import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [UsersModule, JwtModule.register({
    secret: process.env.JWT_SECRET || 'dev',
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  })],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
