import { Controller, Get } from '@nestjs/common';
import { CompanyService } from './company.service.js';

@Controller('companies')
export class CompanyController {
  constructor(private svc: CompanyService) {}
  @Get() list() { return this.svc.list(); }
}
