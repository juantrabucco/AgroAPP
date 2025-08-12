import { SetMetadata } from '@nestjs/common';
import { Actions } from './ability.factory.js';

export const CHECK_ABILITY = 'check_ability';
export interface RequiredAbility { action: Actions; subject: string; }
export const CheckAbility = (action: Actions, subject: string) => SetMetadata(CHECK_ABILITY, { action, subject } as RequiredAbility);
