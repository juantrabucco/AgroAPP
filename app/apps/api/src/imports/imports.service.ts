import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const SPECIES = new Set(['BOVINE','OVINE','CAPRINE','EQUINE','OTHER']);
const SEX = new Set(['M','F']);

@Injectable()
export class ImportsService {
  constructor(private prisma: PrismaService) {}

  async validateAnimals(companyId: string, fieldId: string, rows: any[]) {
    const errors: any[] = [];
    const seen = new Set<string>();
    const existing = await this.prisma.animal.findMany({ where: { companyId }, select: { tagId: true } });
    const existingSet = new Set(existing.map(a => a.tagId));
    rows.forEach((r, idx) => {
      const tag = String(r.tagId || r.caravana || r.TAG || '').trim();
      const species = String(r.species || r.especie || 'BOVINE').toUpperCase();
      const sex = String(r.sex || r.sexo || 'F').toUpperCase();
      const rowErrors: string[] = [];
      if (!tag) rowErrors.push('Falta tagId/caravana');
      if (seen.has(tag)) rowErrors.push('Duplicado en archivo');
      if (existingSet.has(tag)) rowErrors.push('Ya existe en el sistema');
      if (!SPECIES.has(species)) rowErrors.push(`Especie inválida: ${species}`);
      if (!SEX.has(sex)) rowErrors.push(`Sexo inválido: ${sex}`);
      if (rowErrors.length) errors.push({ row: idx + 1, tagId: tag, errors: rowErrors });
      seen.add(tag);
    });
    return { ok: errors.length === 0, errors };
  }

  async animals(companyId: string, fieldId: string, rows: any[]) {
    const data = rows.map(r => ({
      companyId, fieldId,
      tagId: String(r.tagId || r.caravana || r.TAG || '').trim(),
      species: (String(r.species || r.especie || 'BOVINE').toUpperCase() as any),
      sex: (String(r.sex || r.sexo || 'F').toUpperCase() as any),
      birthDate: r.birthDate ? new Date(r.birthDate) : null
    }));
    return this.prisma.animal.createMany({ data, skipDuplicates: true });
  }

  async counterparties(companyId: string, rows: any[]) {
    const data = rows.map(r => ({
      companyId,
      type: (String(r.type || r.tipo || 'CUSTOMER').toUpperCase() as any),
      name: String(r.name || r.nombre || '').trim(),
      taxId: r.taxId || r.cuit || null
    }));
    return this.prisma.counterparty.createMany({ data, skipDuplicates: true });
  }
}
