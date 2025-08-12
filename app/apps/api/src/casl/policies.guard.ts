import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Reflector } from '@nestjs/common';
import { CHECK_ABILITY, RequiredAbility } from './check-abilities.decorator.js';
import { AbilityFactory } from './ability.factory.js';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector, private abilities: AbilityFactory) {}

  canActivate(ctx: ExecutionContext): boolean {
    const reqAbility = this.reflector.get<RequiredAbility>(CHECK_ABILITY, ctx.getHandler());
    if (!reqAbility) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    const ability = this.abilities.createForUser(user);

    // Extract scoping info from request (companyId/fieldId)
    const companyId = req.body?.companyId || req.query?.companyId || user?.defaultCompanyId;
    const fieldId = req.body?.fieldId || req.query?.fieldId;
    const subject = { __caslSubjectType__: reqAbility.subject, companyId, fieldId };

    const ok = ability.can(reqAbility.action as any, subject as any);
    if (!ok) throw new ForbiddenException('No tienes permisos para esta acción en este ámbito');
    return true;
  }
}
