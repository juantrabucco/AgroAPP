import { Body, Controller, Get, Param, Post, Patch, Query, UseGuards } from '@nestjs/common';
import { AnimalService } from './animal.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('animals')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AnimalController {
  @Patch(':id') @CheckAbility('manage','Animal') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  constructor(private svc: AnimalService) {}
  @Post() @CheckAbility('manage','Animal') create(@Body() body: any) { return this.svc.create(body); }
  @Get()  @CheckAbility('read','Animal') list(@Query('companyId') companyId: string) { return this.svc.list(companyId); }
  @Get(':id') @CheckAbility('read','Animal') get(@Param('id') id: string) { return this.svc.get(id); }
}
