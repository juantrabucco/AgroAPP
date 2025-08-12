import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class TaskController {
  constructor(private svc: TaskService) {}
  @Post() @CheckAbility('create','Task') create(@Body() b: any) { return this.svc.create(b); }
  @Get()  @CheckAbility('read','Task') list(@Query('companyId') c: string) { return this.svc.list(c); }
}
