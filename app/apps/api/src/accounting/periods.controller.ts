import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('accounting/periods')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class PeriodsController {
  constructor(private prisma: PrismaService) {}
  @Get() @CheckAbility('read','Account')
  list(@Query('companyId') companyId: string) {
    return this.prisma.periodLock.findMany({ where: { companyId }, orderBy: { toDate: 'desc' } });
  }
  @Post() @CheckAbility('manage','Account')
  create(@Body() b: { companyId: string; fromDate: string; toDate: string; lockedById?: string; }) {
    return this.prisma.periodLock.create({ data: { ...b, fromDate: new Date(b.fromDate), toDate: new Date(b.toDate) } });
  }
}
