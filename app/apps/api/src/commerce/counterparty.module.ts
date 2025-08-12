import { Module } from '@nestjs/common';
import { CounterpartyService } from './counterparty.service.js';
import { CounterpartyController } from './counterparty.controller.js';

@Module({ providers: [CounterpartyService], controllers: [CounterpartyController] })
export class CounterpartyModule {}
