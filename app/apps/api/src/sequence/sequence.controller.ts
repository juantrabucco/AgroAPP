import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('sequences')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SequenceController {
  constructor(private prisma: PrismaService) {}
  @Get() @CheckAbility('read','Sale')
  list(@Query('companyId') companyId: string) { return this.prisma.sequence.findMany({ where: { companyId } }); }
  @Post() @CheckAbility('manage','Sale')
  create(@Body() b: any) { return this.prisma.sequence.create({ data: b }); }
  @Patch(':id') @CheckAbility('manage','Sale')
  update(@Param('id') id: string, @Body() b: any) { return this.prisma.sequence.update({ where: { id }, data: b }); }
}
