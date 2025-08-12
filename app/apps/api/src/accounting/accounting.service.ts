import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}
  listAccounts(companyId: string) { return this.prisma.account.findMany({ where: { companyId } }); }
  async postJournalEntry(data: any) {
    const sumD = data.lines.reduce((a: number, l: any) => a + (l.debit || 0), 0);
    const sumH = data.lines.reduce((a: number, l: any) => a + (l.credit || 0), 0);
    if (Math.round((sumD - sumH)*100) !== 0) throw new Error('Asiento desbalanceado');
    return this.prisma.journalEntry.create({ data: { ...data, lines: { create: data.lines } } });
  }
  ledger(companyId: string, accountId: string) {
    return this.prisma.journalEntryLine.findMany({ where: { accountId, journalEntry: { companyId } },
      include: { journalEntry: true, account: true }, orderBy: { journalEntry: { date: 'asc' } } });
  }
  async statements(companyId: string) {
    // Build balances for Clients (1201) and Suppliers (2101), with simple aging
    const clients = await this.prisma.account.findFirst({ where: { companyId, code: '1201' } });
    const suppliers = await this.prisma.account.findFirst({ where: { companyId, code: '2101' } });
    const accIds = [clients?.id, suppliers?.id].filter(Boolean) as string[];
    const lines = await this.prisma.journalEntryLine.findMany({
      where: { accountId: { in: accIds }, journalEntry: { companyId } },
      include: { journalEntry: true, account: true }
    });
    const now = new Date();
    const buckets = (date: Date) => {
      const days = Math.floor((now.getTime() - new Date(date).getTime()) / 86400000);
      if (days <= 30) return '0-30';
      if (days <= 60) return '31-60';
      if (days <= 90) return '61-90';
      return '90+';
    };
    const map: Record<string, any> = {};
    for (const l of lines) {
      const key = `${l.accountId}|${l.counterpartyId||'unknown'}`;
      if (!map[key]) map[key] = {
        accountId: l.accountId, accountCode: l.account.code, accountName: l.account.name,
        counterpartyId: l.counterpartyId||'unknown', balance: 0, aging: { '0-30':0,'31-60':0,'61-90':0,'90+':0 }
      };
      const amt = (l.debit || 0) - (l.credit || 0);
      map[key].balance += amt;
      const b = buckets(l.journalEntry.date);
      map[key].aging[b] += amt;
    }
    return Object.values(map);
  }
}

  async pl(companyId: string, from: string, to: string) {
    const start = new Date(from); const end = new Date(to);
    const lines = await this.prisma.journalEntryLine.findMany({
      where: { journalEntry: { companyId, date: { gte: start, lte: end } }, account: { type: { in: ['REVENUE','EXPENSE'] } } },
      include: { account: true }
    });
    const sum: any = { revenue: 0, expense: 0, byAccount: {} };
    for (const l of lines) {
      const amt = (l.credit || 0) - (l.debit || 0);
      if (l.account.type === 'REVENUE') sum.revenue += amt; else sum.expense += -amt;
      const key = `${l.account.code} ${l.account.name}`;
      sum.byAccount[key] = (sum.byAccount[key]||0) + (l.account.type==='REVENUE'? amt : -amt);
    }
    sum.net = sum.revenue - sum.expense;
    return sum;
  }

  async balance(companyId: string, to: string) {
    const end = new Date(to);
    const lines = await this.prisma.journalEntryLine.findMany({
      where: { journalEntry: { companyId, date: { lte: end } } },
      include: { account: true }
    });
    const map: any = { ASSET: 0, LIABILITY: 0, EQUITY: 0, byAccount: {} };
    for (const l of lines) {
      const amt = (l.debit || 0) - (l.credit || 0);
      const t = l.account.type;
      map[t] = (map[t]||0) + (t==='ASSET'? amt : -amt);
      const key = `${l.account.code} ${l.account.name}`;
      map.byAccount[key] = (map.byAccount[key]||0) + (t==='ASSET'? amt : -amt);
    }
    map.assets = map.ASSET; map.liabilities = map.LIABILITY; map.equity = map.EQUITY;
    map.balanceCheck = map.assets - (map.liabilities + map.equity);
    return map;
  }
