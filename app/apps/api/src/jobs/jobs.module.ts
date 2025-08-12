import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
