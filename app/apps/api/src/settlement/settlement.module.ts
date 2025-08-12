import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service.js';
import { SettlementController } from './settlement.controller.js';

@Module({ providers: [SettlementService], controllers: [SettlementController] })
export class SettlementModule {}
