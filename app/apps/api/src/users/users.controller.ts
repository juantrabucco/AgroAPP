import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
