import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('lots')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class LotController {
  constructor(private prisma: PrismaService) {}
  @Get() @CheckAbility('read','Animal')
  list(@Query('fieldId') fieldId: string) { return this.prisma.lot.findMany({ where: { fieldId }, include: { _count: { select: { animals: true } } } }); }
  @Post() @CheckAbility('manage','Animal')
  create(@Body() b: any) { return this.prisma.lot.create({ data: b }); }
  @Patch(':id') @CheckAbility('manage','Animal')
  update(@Param('id') id: string, @Body() b: any) { return this.prisma.lot.update({ where: { id }, data: b }); }
  @Delete(':id') @CheckAbility('manage','Animal')
  remove(@Param('id') id: string) { return this.prisma.lot.delete({ where: { id } }); }
}
