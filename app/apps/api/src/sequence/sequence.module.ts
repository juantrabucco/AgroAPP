import { Module } from '@nestjs/common';
import { SequenceController } from './sequence.controller.js';

@Module({ controllers: [SequenceController] })
export class SequenceModule {}
