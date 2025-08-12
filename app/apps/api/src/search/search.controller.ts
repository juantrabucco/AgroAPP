import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('search')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SearchController {
  constructor(private prisma: PrismaService) {}
  @Get() @CheckAbility('read','Animal')
  async search(@Query('companyId') companyId: string, @Query('q') q: string) {
    const like = q ? q : '';
    const animals = await this.prisma.animal.findMany({ where: { companyId, OR: [{ tagId: { contains: like, mode: 'insensitive' } }] }, take: 5 });
    const counterparties = await this.prisma.counterparty.findMany({ where: { companyId, OR: [{ name: { contains: like, mode: 'insensitive' } }, { taxId: { contains: like, mode: 'insensitive' } }] }, take: 5 });
    const items = await this.prisma.item.findMany({ where: { companyId, name: { contains: like, mode: 'insensitive' } }, take: 5 });
    return { animals, counterparties, items };
  }
}
