import { Module } from '@nestjs/common';
import { PaddockService } from './paddock.service.js';
import { PaddockController } from './paddock.controller.js';

@Module({ providers: [PaddockService], controllers: [PaddockController] })
export class PaddockModule {}
