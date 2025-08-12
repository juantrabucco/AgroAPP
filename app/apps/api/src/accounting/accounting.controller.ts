import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('accounting')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AccountingController {\n  @Get('pl') @CheckAbility('read','Account') pl(@Query('companyId') c: string, @Query('from') f: string, @Query('to') t: string) { return this.svc.pl(c,f,t); }\n  @Get('balance') @CheckAbility('read','Account') balance(@Query('companyId') c: string, @Query('to') t: string) { return this.svc.balance(c,t); }
  constructor(private svc: AccountingService) {}
  @Get('accounts') @CheckAbility('read','Account') list(@Query('companyId') c: string) { return this.svc.listAccounts(c); }
  @Post('journal') @CheckAbility('post','JournalEntry') post(@Body() b: any) { return this.svc.postJournalEntry(b); }
  @Get('ledger') @CheckAbility('read','Account') ledger(@Query('companyId') c: string, @Query('accountId') a: string) { return this.svc.ledger(c, a); }
  @Get('statements') @CheckAbility('read','Account') statements(@Query('companyId') c: string) { return this.svc.statements(c); }
}
