import { Controller, Get } from '@nestjs/common';

@Controller('healthz')
export class HealthzController {
  @Get()
  ping() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
