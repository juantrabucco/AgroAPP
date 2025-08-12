import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MovementService } from './movement.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('movements')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class MovementController {
  constructor(private svc: MovementService) {}
  @Post() @CheckAbility('manage','Animal') create(@Body() b: any) { return this.svc.create(b); }
  @Get()  @CheckAbility('read','Animal') list(@Query('animalId') id: string) { return this.svc.list(id); }
}
