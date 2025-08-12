import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FieldService {
  constructor(private prisma: PrismaService) {}
  create(companyId: string, name: string, location?: string) { 
    return this.prisma.field.create({ data: { companyId, name, location } });
  }
  list(companyId: string) { return this.prisma.field.findMany({ where: { companyId } }); }
}
