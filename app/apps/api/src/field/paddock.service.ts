import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PaddockService {
  constructor(private prisma: PrismaService) {}
  create(data: any) { return this.prisma.paddock.create({ data }); }
  list(fieldId: string) { return this.prisma.paddock.findMany({ where: { fieldId } }); }
  update(id: string, data: any) { return this.prisma.paddock.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.paddock.delete({ where: { id } }); }
}
