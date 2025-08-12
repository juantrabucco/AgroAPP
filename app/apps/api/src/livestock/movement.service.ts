import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MovementService {
  constructor(private prisma: PrismaService) {}
  create(data: any) { return this.prisma.animalMovement.create({ data }); }
  list(animalId: string) { return this.prisma.animalMovement.findMany({ where: { animalId }, include: { fromPaddock: true, toPaddock: true } }); }
}
