import { Module } from '@nestjs/common';
import { PeriodsController } from './periods.controller.js';
import { AccountingService } from './accounting.service.js';
import { AccountingController } from './accounting.controller.js';

@Module({ providers: [AccountingService], controllers: [AccountingController, PeriodsController] })
export class AccountingModule {}
