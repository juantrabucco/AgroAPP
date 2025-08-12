import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommerceService } from './commerce.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('commerce')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class CommerceController {
  constructor(private svc: CommerceService) {}
  @Post('sales') @CheckAbility('manage','Sale') createSale(@Body() b: any) { return this.svc.createSale(b); }
  @Post('purchases') @CheckAbility('manage','Purchase') createPurchase(@Body() b: any) { return this.svc.createPurchase(b); }
  @Get('sales') @CheckAbility('read','Sale') listSales(@Query('companyId') c: string) { return this.svc.listSales(c); }
  @Get('purchases') @CheckAbility('read','Purchase') listPurchases(@Query('companyId') c: string) { return this.svc.listPurchases(c); }
  @Get('summary/monthly') @CheckAbility('read','Sale')
  monthly(@Query('companyId') c: string, @Query('year') y?: string) { return this.svc.monthlySummary(c, y ? parseInt(y) : undefined); }
}
