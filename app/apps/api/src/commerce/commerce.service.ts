import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CommerceService {\n  async nextNumber(companyId: string, type: string, prefix: string = '') {\n    const seq = await this.prisma.sequence.upsert({ where: { companyId_type: { companyId, type } }, update: { nextNumber: { increment: 1 } }, create: { companyId, type, prefix, nextNumber: 2 } });\n    const num = seq.nextNumber - 1;\n    return `${prefix}${String(num).padStart(8, '0')}`;\n  }
  constructor(private prisma: PrismaService) {}

  async findAccount(companyId: string, code: string) {
    const acc = await this.prisma.account.findFirst({ where: { companyId, code } });
    if (!acc) throw new Error(`Cuenta contable ${code} no existe para la empresa`);
    return acc;
  }

  async createSale(data: any) {
    const total = data.lines.reduce((s: number, l: any) => s + l.qty * l.price, 0);
    const sale = await this.prisma.sale.create({ data: { ...data, total }, include: { lines: true } });
    const caja = await this.findAccount(data.companyId, '1101');
    const clientes = await this.findAccount(data.companyId, '1201');
    const ventas = await this.findAccount(data.companyId, '4101');
    const debitAcc = data.payment === 'CASH' ? caja : clientes;
    await this.prisma.journalEntry.create({
      data: {
        companyId: data.companyId, date: new Date(data.date),
        memo: `Venta ${sale.id}`, sourceType: 'Sale', sourceId: sale.id,
        lines: { create: [
          { accountId: debitAcc.id, debit: total, credit: 0, counterpartyId: data.counterpartyId },
          { accountId: ventas.id, debit: 0, credit: total, counterpartyId: data.counterpartyId },
        ]}
      }
    });
    return sale;
  }

  async createPurchase(data: any) {
    const total = data.lines.reduce((s: number, l: any) => s + l.qty * l.price, 0);
    const purchase = await this.prisma.purchase.create({ data: { ...data, total }, include: { lines: true } });
    const insumos = await this.findAccount(data.companyId, '1301');
    const proveedores = await this.findAccount(data.companyId, '2101');
    const caja = await this.findAccount(data.companyId, '1101');
    const creditAcc = data.payment === 'CASH' ? caja : proveedores;
    await this.prisma.journalEntry.create({
      data: {
        companyId: data.companyId, date: new Date(data.date),
        memo: `Compra ${purchase.id}`, sourceType: 'Purchase', sourceId: purchase.id,
        lines: { create: [
          { accountId: insumos.id, debit: total, credit: 0, counterpartyId: data.counterpartyId },
          { accountId: creditAcc.id, debit: 0, credit: total, counterpartyId: data.counterpartyId },
        ]}
      }
    });
    return purchase;
  }

  listSales(companyId: string) {
    return this.prisma.sale.findMany({ where: { companyId }, include: { lines: true, counterparty: true } });
  }
  listPurchases(companyId: string) {
    return this.prisma.purchase.findMany({ where: { companyId }, include: { lines: true, counterparty: true } });
  }

  async monthlySummary(companyId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const from = new Date(Date.UTC(y, 0, 1));
    const to = new Date(Date.UTC(y + 1, 0, 1));
    const sales = await this.prisma.sale.findMany({ where: { companyId, date: { gte: from, lt: to } } });
    const purchases = await this.prisma.purchase.findMany({ where: { companyId, date: { gte: from, lt: to } } });
    const months = Array.from({ length: 12 }, (_, i) => i);
    const agg = months.map(m => ({
      month: m + 1,
      sales: 0,
      purchases: 0,
    }));
    for (const s of sales) { const m = new Date(s.date).getUTCMonth(); agg[m].sales += s.total; }
    for (const p of purchases) { const m = new Date(p.date).getUTCMonth(); agg[m].purchases += p.total; }
    return { year: y, rows: agg };
  }
}
