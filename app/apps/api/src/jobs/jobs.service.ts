import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class JobsService implements OnModuleInit {
  private queue: Queue;
  private worker: Worker;
  private redis: IORedis;

  constructor(private prisma: PrismaService) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379/0';
    this.redis = new IORedis(url);
    this.queue = new Queue('notifications', { connection: this.redis });
  }

  onModuleInit() {
    this.worker = new Worker('notifications', async (job) => {
      const data: any = job.data;
      if (data.type === 'health-due') {
        const ev = await this.prisma.healthEvent.findUnique({ where: { id: data.healthEventId }, include: { field: true, lot: true } });
        if (!ev) return;
        await this.prisma.notification.create({
          data: {
            companyId: ev.companyId,
            type: 'HEALTH_DUE',
            title: `Vence evento sanitario: ${ev.type} (${ev.field?.name||''}/${ev.lot?.name||''})`,
            payload: { healthEventId: ev.id, dueDate: ev.dueDate },
            dueDate: ev.dueDate,
          }
        });
      }
    }, { connection: this.redis });
  }

  async scheduleReminder(data: any & { delayMs: number }) {
    const opts: JobsOptions = { delay: Math.max(0, data.delayMs), removeOnComplete: true, attempts: 3 };
    await this.queue.add('notify', data, opts);
  }
}
