import { Module } from '@nestjs/common';
import { CommerceService } from './commerce.service.js';
import { CommerceController } from './commerce.controller.js';

@Module({ providers: [CommerceService], controllers: [CommerceController] })
export class CommerceModule {}
