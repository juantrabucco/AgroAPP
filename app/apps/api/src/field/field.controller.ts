import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('fields')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FieldController {
  constructor(private prisma: PrismaService) {}
  @Get() @CheckAbility('read','Animal')
  list() { return this.prisma.field.findMany({}); }
  @Post() @CheckAbility('manage','Animal')
  create(@Body() b: any) { return this.prisma.field.create({ data: b }); }
}
