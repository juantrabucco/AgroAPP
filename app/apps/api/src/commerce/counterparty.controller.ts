import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CounterpartyService } from './counterparty.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('counterparties')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class CounterpartyController {
  constructor(private svc: CounterpartyService) {}
  @Post() @CheckAbility('manage','Purchase') create(@Body() b: any) { return this.svc.create(b); }
  @Get()  @CheckAbility('read','Purchase') list(@Query('companyId') c: string) { return this.svc.list(c); }
}
