import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AnimalService {
  update(id: string, data: any) { return this.prisma.animal.update({ where: { id }, data }); }
  constructor(private prisma: PrismaService) {}
  create(data: any) { return this.prisma.animal.create({ data }); }
  list(companyId: string) { return this.prisma.animal.findMany({ where: { companyId }, include: { lot: true, field: true } }); }
  get(id: string) {
    return this.prisma.animal.findUnique({ where: { id }, include: { lot: true, field: true, movements: { include: { fromPaddock: true, toPaddock: true }, orderBy: { date: 'desc' } } } });
  }
}
