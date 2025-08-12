import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SettlementService } from './settlement.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('settlements')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SettlementController {
  constructor(private svc: SettlementService) {}
  @Post('receipt') @CheckAbility('manage','Sale') receipt(@Body() b: any) { return this.svc.receipt(b); }
  @Post('payment') @CheckAbility('manage','Purchase') payment(@Body() b: any) { return this.svc.payment(b); }
  @Get() @CheckAbility('read','Account') list(@Query('companyId') c: string) { return this.svc.list(c); }
}
