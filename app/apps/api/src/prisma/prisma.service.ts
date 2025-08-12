import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getCtx } from '../common/request-context.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    // Multi-tenant scoping
    this.$use(async (params, next) => {
      const ctx = getCtx();
      const companyId = ctx?.companyId;
      const mtModels = new Set([
        'Field','Paddock','Lot','Animal','AnimalMovement','HealthPlan','HealthEvent','HealthApplication',
        'Task','Counterparty','Item','Sale','Purchase','Account','JournalEntry','JournalEntryLine','FileObject','AuditLog'
      ]);
      const hasCompany = (obj: any) => obj && Object.prototype.hasOwnProperty.call(obj, 'companyId');
      if (companyId && mtModels.has(params.model!)) {
        if (['findFirst','findMany','count','aggregate','groupBy'].includes(params.action)) {
          params.args = params.args || {};
          params.args.where = params.args.where || {};
          if (!hasCompany(params.args.where)) params.args.where.companyId = companyId;
        } else if (['findUnique','delete','update'].includes(params.action)) {
          // Expect where.id provided, can't inject companyId here
        } else if (['updateMany','deleteMany'].includes(params.action)) {
          params.args = params.args || {};
          params.args.where = params.args.where || {};
          if (!hasCompany(params.args.where)) params.args.where.companyId = companyId;
        } else if (params.action === 'create') {
          params.args = params.args || {};
          params.args.data = params.args.data || {};
          if (!hasCompany(params.args.data)) params.args.data.companyId = companyId;
        } else if (params.action === 'upsert') {
          params.args = params.args || {};
          params.args.create = params.args.create || {};
          params.args.update = params.args.update || {};
          if (!hasCompany(params.args.create)) params.args.create.companyId = companyId;
          if (!hasCompany(params.args.update)) params.args.update.companyId = companyId;
        }
      }
      return next(params);
    });
    // AuditLog for CUD
    this.$use(async (params, next) => {
      const result = await next(params);
      const CUD = ['create','update','delete','updateMany','deleteMany','upsert'];
      if (params.model && params.model !== 'AuditLog' && CUD.includes(params.action)) {
        try {
          const before = (params.action.includes('update') || params.action.includes('delete')) ? params.args?.where : null;
          await this.audit(params.model, params.action, params.args, result);
        } catch (e) { /* swallow audit errors */ }
      }
      return result;
    });

  }
  async onModuleDestroy() { await this.$disconnect(); }
}

  async audit(table: string, action: string, args: any, result: any) {
    try {
      const companyId = (args?.data?.companyId) || (args?.where?.companyId) || null;
      await this.auditLog.create({ data: {
        companyId, table, action, before: args?.where || null, after: result || null
      } });
    } catch {}
  }

    // PeriodLock check
    this.$use(async (params, next) => {
      if (params.model === 'JournalEntry' && (params.action === 'create' || params.action === 'update')) {
        const data = params.args?.data || {};
        const companyId = data.companyId || params.args?.where?.companyId || data.company?.connect?.id;
        const date = (data.date) ? new Date(data.date) : null;
        if (companyId && date) {
          const lock = await this.periodLock.findFirst({ where: { companyId }, orderBy: { toDate: 'desc' } });
          if (lock && date <= lock.toDate) {
            throw new Error(`Periodo cerrado hasta ${lock.toDate.toISOString().slice(0,10)}`);
          }
        }
      }
      return next(params);
    });
