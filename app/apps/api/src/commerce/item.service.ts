import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}
  create(data: any) { return this.prisma.item.create({ data }); }
  list(companyId: string) { return this.prisma.item.findMany({ where: { companyId } }); }
}
