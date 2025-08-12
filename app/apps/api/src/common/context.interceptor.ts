import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { runWithCtx } from './request-context.js';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const req: any = context.switchToHttp().getRequest();
    const user = req.user;
    const companyId = user?.defaultCompanyId || user?.roles?.[0]?.companyId;
    const fieldIds = (user?.roles || []).filter((r: any) => !!r.fieldId).map((r: any) => r.fieldId);
    return runWithCtx({ user, companyId, fieldIds }, () => next.handle());
  }
}
