import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaddockService } from './paddock.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('paddocks')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class PaddockController {
  constructor(private svc: PaddockService) {}
  @Post() @CheckAbility('manage','Task') create(@Body() b: any) { return this.svc.create(b); }
  @Get()  @CheckAbility('read','Task') list(@Query('fieldId') f: string) { return this.svc.list(f); }
  @Patch(':id') @CheckAbility('manage','Task') update(@Param('id') id: string, @Body() b: any) { return this.svc.update(id, b); }
  @Delete(':id') @CheckAbility('manage','Task') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
