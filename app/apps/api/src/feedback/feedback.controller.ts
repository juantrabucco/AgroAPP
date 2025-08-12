import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('feedback')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FeedbackController {
  constructor(private prisma: PrismaService) {}
  @Post() @CheckAbility('manage','Account')
  async create(@Body() b: { companyId: string; userId: string; message: string }) {
    return this.prisma.notification.create({
      data: { companyId: b.companyId, type: 'FEEDBACK', title: `Feedback de usuario`, payload: { userId: b.userId, message: b.message } }
    });
  }
}
