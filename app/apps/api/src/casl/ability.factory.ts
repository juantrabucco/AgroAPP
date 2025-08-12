import { Injectable } from '@nestjs/common';
import { PrismaAbility, createPrismaAbility } from '@casl/prisma';
import { AbilityBuilder } from '@casl/ability';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'export' | 'post';
type Subjects = 'all' | 'Animal' | 'HealthPlan' | 'HealthEvent' | 'HealthApplication' | 'Task' | 'Sale' | 'Purchase' | 'Counterparty' | 'Item' | 'Account' | 'JournalEntry';

export type AppAbility = PrismaAbility<[Actions, Subjects]>;

@Injectable()
export class AbilityFactory {
  createForUser(user: any): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    const roles = (user?.roles || []).map((r: any) => r.role);
    const companyIds = (user?.roles || []).map((r: any) => r.companyId);
    const fieldIds = (user?.roles || []).filter((r: any) => !!r.fieldId).map((r: any) => r.fieldId);

    const inCompany = (cond: any = {}) => ({ ...cond, companyId: { in: companyIds } });
    const inFields  = (cond: any = {}) => ({ ...cond, fieldId: { in: fieldIds } });

    if (roles.includes('OWNER') || roles.includes('ADMIN')) {
      can('manage', 'all', inCompany());
    }
    if (roles.includes('FOREMAN')) {
      can('manage', 'Animal', inCompany());
      can('manage', 'Task', inFields());
      can('manage', 'HealthEvent', inFields());
      can('manage', 'HealthApplication', inFields());
      can('read', 'Sale', inCompany());
      can('read', 'Purchase', inCompany());
      cannot('post', 'JournalEntry'); // no contabilidad
    }
    if (roles.includes('WORKER')) {
      can('create', 'HealthApplication', inFields());
      can('read', 'HealthEvent', inFields());
      can('create', 'Task', inFields());
      can('read', 'Animal', inFields());
      cannot('read', 'Sale'); cannot('read', 'Purchase'); cannot('post', 'JournalEntry');
    }
    if (roles.includes('ACCOUNTANT')) {
      can('manage', 'Sale', inCompany());
      can('manage', 'Purchase', inCompany());
      can('manage', 'Account', inCompany());
      can('post', 'JournalEntry', inCompany());
      can('read', 'Animal', inCompany());
      can('read', 'HealthApplication', inCompany());
    }

    return build({
      detectSubjectType: (subject) => subject as any,
    });
  }
}
