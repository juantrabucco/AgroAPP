@@ -7,61 +7,63 @@ import { CompanyModule } from './company/company.module.js';
import { FieldModule } from './field/field.module.js';
import { PaddockModule } from './field/paddock.module.js';
import { AnimalModule } from './livestock/animal.module.js';
import { MovementModule } from './livestock/movement.module.js';
import { HealthModule } from './health/health.module.js';
import { TaskModule } from './tasks/task.module.js';
import { CommerceModule } from './commerce/commerce.module.js';
import { CounterpartyModule } from './commerce/counterparty.module.js';
import { ItemModule } from './commerce/item.module.js';
import { AccountingModule } from './accounting/accounting.module.js';
import { FilesModule } from './files/files.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ContextInterceptor } from './common/context.interceptor.js';
import { ReportsModule } from './reports/reports.module.js';
import { RbacModule } from './rbac/rbac.module.js';
import { ImportsModule } from './imports/imports.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { SequenceModule } from './sequence/sequence.module.js';
import { FeedbackModule } from './feedback/feedback.module.js';
import { SearchModule } from './search/search.module.js';
import { AdminModule } from './admin/admin.module.js';
import { SettlementModule } from './settlement/settlement.module.js';
import { AuditModule } from './audit/audit.module.js';
import { HealthzModule } from './healthz/healthz.module.js';

@Module({
  imports: [
    AdminModule,
    SearchModule,
    FeedbackModule,
    SequenceModule,
    JobsModule,
    NotificationsModule,
    SettlementModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HealthzModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    FieldModule,
    PaddockModule,
    AnimalModule,
    MovementModule,
    HealthModule,
    TaskModule,
    CommerceModule,
    CounterpartyModule,
    ItemModule,
    AccountingModule,
    FilesModule,
    JobsModule,
    ReportsModule,
    RbacModule,
    ImportsModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ContextInterceptor }
  ]
})
