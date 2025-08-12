import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service.js';
import { RbacController } from './rbac.controller.js';

@Module({ providers: [RbacService], controllers: [RbacController] })
export class RbacModule {}
