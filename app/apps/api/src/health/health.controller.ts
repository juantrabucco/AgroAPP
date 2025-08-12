import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('health')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class HealthController {
  @Get('events') @CheckAbility('read','HealthEvent') listEvents(@Query() q: any) { return this.svc.listEvents(q); }
  constructor(private svc: HealthService) {}
  @Post('plans') @CheckAbility('manage','HealthPlan') createPlan(@Body() b: any) { return this.svc.createPlan(b); }
  @Get('plans')  @CheckAbility('read','HealthPlan') listPlans(@Query('companyId') c: string) { return this.svc.listPlans(c); }
  @Post('events') @CheckAbility('manage','HealthEvent') createEvent(@Body() b: any) { return this.svc.createEvent(b); }
  // Peón: puede crear aplicaciones sanitarias si fieldId asignado
  @Post('apply') @CheckAbility('create','HealthApplication') apply(@Body() b: any) { return this.svc.apply(b); }
}
