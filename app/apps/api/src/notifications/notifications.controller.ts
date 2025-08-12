import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get('count') @CheckAbility('read','HealthEvent')
  async count(@Query('companyId') companyId: string, @Query('status') status?: string) {
    const where:any = { companyId };
    if (status === 'unread') where.readAt = null;
    const n = await this.prisma.notification.count({ where });
    return { count: n };
  }

  @Get() @CheckAbility('read','HealthEvent')
  async list(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.prisma.notification.findMany({
      where: {
        companyId,
        readAt: status === 'unread' ? null : undefined
      },
      orderBy: [{ readAt: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }]
    });
  }

  @Patch(':id/read') @CheckAbility('manage','HealthEvent')
  async markRead(@Param('id') id: string, @Body() body: any) {
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
}
