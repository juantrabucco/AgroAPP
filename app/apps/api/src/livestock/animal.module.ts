import { Module } from '@nestjs/common';
import { AnimalService } from './animal.service.js';
import { AnimalController } from './animal.controller.js';

@Module({ providers: [AnimalService], controllers: [AnimalController] })
export class AnimalModule {}
