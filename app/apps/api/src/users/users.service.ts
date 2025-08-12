import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findMe(id: string) { return this.prisma.user.findUnique({ where: { id }, include: { roles: true } }); }
}
