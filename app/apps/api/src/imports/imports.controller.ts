import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ImportsService } from './imports.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('imports')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ImportsController {
  constructor(private svc: ImportsService) {}
  @Post('animals/validate') @CheckAbility('manage','Animal')
  validateAnimals(@Body() b: { companyId: string; fieldId: string; rows: any[] }) { return this.svc.validateAnimals(b.companyId, b.fieldId, b.rows); }
  @Post('animals') @CheckAbility('manage','Animal')
  animals(@Body() b: { companyId: string; fieldId: string; rows: any[] }) { return this.svc.animals(b.companyId, b.fieldId, b.rows); }
  @Post('counterparties') @CheckAbility('manage','Purchase')
  counterparties(@Body() b: { companyId: string; rows: any[] }) { return this.svc.counterparties(b.companyId, b.rows); }
}
