import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
  create(data: any) { return this.prisma.task.create({ data }); }
  list(companyId: string) { return this.prisma.task.findMany({ where: { companyId } }); }
}
