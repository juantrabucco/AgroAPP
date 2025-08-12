import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('audit')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AuditController {
  constructor(private prisma: PrismaService) {}
  @Get() @CheckAbility('read','Account') // restringimos a roles altos
  list(@Query('companyId') companyId: string, @Query('table') table?: string) {
    return this.prisma.auditLog.findMany({
      where: { companyId, table: table || undefined },
      orderBy: { createdAt: 'desc' }, take: 100
    });
  }
}
