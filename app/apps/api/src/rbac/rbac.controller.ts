import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('rbac')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class RbacController {
  constructor(private svc: RbacService) {}
  @Get('users') @CheckAbility('manage','Account') users(@Query('companyId') companyId: string) { return this.svc.users(companyId); }
  @Post('assign') @CheckAbility('manage','Account') assign(@Body() b: any) { return this.svc.assign(b); }
}
