import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CounterpartyService {
  constructor(private prisma: PrismaService) {}
  create(data: any) { return this.prisma.counterparty.create({ data }); }
  list(companyId: string) { return this.prisma.counterparty.findMany({ where: { companyId } }); }
}
