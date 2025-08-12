import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('items')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ItemController {
  constructor(private svc: ItemService) {}
  @Post() @CheckAbility('manage','Purchase') create(@Body() b: any) { return this.svc.create(b); }
  @Get()  @CheckAbility('read','Purchase') list(@Query('companyId') c: string) { return this.svc.list(c); }
}
