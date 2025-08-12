import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { roles: true } });
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const defaultRole = user.roles[0];
    const payload = { sub: user.id, email: user.email, defaultCompanyId: defaultRole?.companyId, roles: user.roles };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token, user: { id: user.id, email: user.email, roles: user.roles } };
  }

  async registerCompanyOwner(email: string, password: string, companyName: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({ data: { name: companyName } });
      const user = await tx.user.create({ data: { email, passwordHash: hash, name: 'Owner' } });
      await tx.roleAssignment.create({ data: { userId: user.id, companyId: company.id, role: 'OWNER' } });
      return { user, company };
    });
  }
}
