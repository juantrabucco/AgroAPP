import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  async receipt(data: any) {
    // Cliente paga: Debe Caja (1101) / Haber Clientes (1201)
    const caja = await this.prisma.account.findFirst({ where: { companyId: data.companyId, code: '1101' } });
    const clientes = await this.prisma.account.findFirst({ where: { companyId: data.companyId, code: '1201' } });
    const st = await this.prisma.settlement.create({ data: { ...data, kind: 'RECEIPT' } });
    await this.prisma.journalEntry.create({ data: {
      companyId: data.companyId, date: new Date(data.date), memo: `Cobranza ${st.id}`, sourceType: 'Settlement', sourceId: st.id,
      lines: { create: [
        { accountId: caja!.id, debit: data.amount, credit: 0, counterpartyId: data.counterpartyId },
        { accountId: clientes!.id, debit: 0, credit: data.amount, counterpartyId: data.counterpartyId },
      ]}
    }});
    return st;
  }

  async payment(data: any) {
    // Pago a proveedor: Debe Proveedores (2101) / Haber Caja (1101)
    const proveedores = await this.prisma.account.findFirst({ where: { companyId: data.companyId, code: '2101' } });
    const caja = await this.prisma.account.findFirst({ where: { companyId: data.companyId, code: '1101' } });
    const st = await this.prisma.settlement.create({ data: { ...data, kind: 'PAYMENT' } });
    await this.prisma.journalEntry.create({ data: {
      companyId: data.companyId, date: new Date(data.date), memo: `Pago ${st.id}`, sourceType: 'Settlement', sourceId: st.id,
      lines: { create: [
        { accountId: proveedores!.id, debit: data.amount, credit: 0, counterpartyId: data.counterpartyId },
        { accountId: caja!.id, debit: 0, credit: data.amount, counterpartyId: data.counterpartyId },
      ]}
    }});
    return st;
  }

  list(companyId: string) {
    return this.prisma.settlement.findMany({ where: { companyId }, include: { counterparty: true }, orderBy: { date: 'desc' } });
  }
}
