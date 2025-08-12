import { JobsService } from '../jobs/jobs.service.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HealthService {
  listEvents(q: any) { const { companyId, from, to, type, fieldId } = q; return this.prisma.healthEvent.findMany({ where: { companyId, fieldId: fieldId||undefined, type: type||undefined, dueDate: { gte: from? new Date(from): undefined, lte: to? new Date(to): undefined } }, include: { field: true, lot: true, applications: true }, orderBy: { dueDate: 'desc' } }); }
  constructor(private prisma: PrismaService, private jobs: JobsService) {}
  createPlan(data: any) { return this.prisma.healthPlan.create({ data }); }
  listPlans(companyId: string) { return this.prisma.healthPlan.findMany({ where: { companyId } }); }
  async createEvent(data: any) { const ev = await this.prisma.healthEvent.create({ data }); const due = new Date(data.dueDate).getTime() - Date.now(); if (due>0) await this.jobs.scheduleReminder({ type:'health-due', healthEventId: ev.id, delayMs: due }); return ev; }
  async apply(data: any) {
    const app = await this.prisma.healthApplication.create({ data });
    // Posteo contable: Debe Gasto sanitario (5101) / Haber Caja (1101) por 'cost'
    if (data.cost && data.companyId) {
      const gasto = await this.prisma.account.findFirst({ where: { companyId: data.companyId, code: '5101' } });
      const caja = await this.prisma.account.findFirst({ where: { companyId: data.companyId, code: '1101' } });
      if (gasto && caja) {
        await this.prisma.journalEntry.create({
          data: {
            companyId: data.companyId, date: new Date(data.date || new Date()),
            memo: `Aplicación sanitaria ${app.id}`,
            sourceType: 'HealthApplication', sourceId: app.id,
            lines: { create: [
              { accountId: gasto.id, debit: data.cost, credit: 0, fieldId: data.fieldId ?? null },
              { accountId: caja.id, debit: 0, credit: data.cost, fieldId: data.fieldId ?? null },
            ]}
          }
        });
      }
    }
    return app;
  }
}
