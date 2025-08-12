import { Module } from '@nestjs/common';
import { MovementService } from './movement.service.js';
import { MovementController } from './movement.controller.js';

@Module({ providers: [MovementService], controllers: [MovementController] })
export class MovementModule {}
