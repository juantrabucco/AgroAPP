import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}
  users(companyId: string) {
    return this.prisma.user.findMany({ include: { roles: true } });
  }
  assign(data: { userId: string; companyId: string; role: Role; fieldId?: string | null }) {
    return this.prisma.roleAssignment.create({ data });
  }
}
