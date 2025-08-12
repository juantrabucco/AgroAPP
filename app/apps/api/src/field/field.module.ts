import { Module } from '@nestjs/common';
import { FieldController } from './field.controller.js';
import { LotController } from './lot.controller.js';
import { PaddockModule } from './paddock.module.js';

@Module({ imports: [PaddockModule], controllers: [FieldController, LotController] })
export class FieldModule {}
