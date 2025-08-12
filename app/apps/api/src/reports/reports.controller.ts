import { Controller, Get, Param, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service.js';
import { AccountingService } from '../accounting/accounting.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('reports')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ReportsController {
  constructor(private svc: ReportsService, private prisma: PrismaService, private accounting: AccountingService) {}

  @Post('pdf') @CheckAbility('export','JournalEntry')
  async pdf(@Body() body: { html?: string; title?: string; rows?: any[] }, @Res() res: Response) {
    let html = body.html;
    if (!html && body.rows && body.rows.length) {
      const rowsHtml = body.rows.map(r => `<tr>${Object.values(r).map(v => `<td>${String(v ?? '')}</td>`).join('')}</tr>`).join('');
      html = `<html><body><h1>${body.title||'Reporte'}</h1><table border="1" cellspacing="0" cellpadding="4">${rowsHtml}</table></body></html>`;
    }
    if (!html) { res.status(400).send('Debe enviar html o rows'); return; }
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte.pdf"`);
    res.send(pdf);
  }

  @Get('sale/:id/pdf') @CheckAbility('read','Sale')
  async salePdf(@Param('id') id: string, @Res() res: Response) {
    const sale = await this.prisma.sale.findUnique({ where: { id }, include: { lines: { include: { item: true } }, counterparty: true } });
    if (!sale) { res.status(404).send('No encontrada'); return; }
    const html = this.svc.sale(sale as any);
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="venta_${sale.id}.pdf"`);
    res.send(pdf);
  }

  @Get('purchase/:id/pdf') @CheckAbility('read','Purchase')
  async purchasePdf(@Param('id') id: string, @Res() res: Response) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id }, include: { lines: { include: { item: true } }, counterparty: true } });
    if (!purchase) { res.status(404).send('No encontrada'); return; }
    const html = this.svc.purchase(purchase as any);
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="compra_${purchase.id}.pdf"`);
    res.send(pdf);
  }

  @Get('health-application/:id/pdf') @CheckAbility('read','HealthApplication')
  async healthPdf(@Param('id') id: string, @Res() res: Response) {
    const app = await this.prisma.healthApplication.findUnique({ where: { id }, include: { animal: true, lot: true, field: true } });
    if (!app) { res.status(404).send('No encontrada'); return; }
    const html = this.svc.health(app as any);
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sanidad_${app.id}.pdf"`);
    res.send(pdf);
  }
}

  @Get('sanidad/mes') @CheckAbility('export','HealthEvent')
  async sanidadMes(@Query('companyId') companyId: string, @Query('fieldId') fieldId: string, @Query('year') year: string, @Query('month') month: string, @Res() res: Response) {
    const y = parseInt(year), m = parseInt(month)-1;
    const from = new Date(Date.UTC(y,m,1)); const to = new Date(Date.UTC(y,m+1,1));
    const evs = await this.prisma.healthEvent.findMany({ where: { companyId, fieldId, dueDate: { gte: from, lt: to } }, include: { field: true, lot: true, applications: true } });
    const rows = evs.map(e => ({ Fecha: new Date(e.dueDate).toISOString().slice(0,10), Tipo: e.type, Campo: e.field?.name, Lote: e.lot?.name||'', Aplicadas: e.applications.length }));
    const htmlRows = rows.map(r => `<tr><td>${r.Fecha}</td><td>${r.Tipo}</td><td>${r.Campo}</td><td>${r.Lote}</td><td>${r.Aplicadas}</td></tr>`).join('');
    const html = this.svc.calendarReport({ title: 'Calendario Sanitario', meta: `${y}-${m+1} — Campo: ${evs[0]?.field?.name||''}`, rows });
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="calendario_sanidad.pdf"'); res.send(pdf);
  }

  @Get('pl/pdf') @CheckAbility('export','Account')
  async plPdf(@Query('companyId') companyId: string, @Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const sum = await this.accounting.pl(companyId, from, to);
    const html = this.svc.plReport(sum, from, to);
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="estado_resultados.pdf"'); res.send(pdf);
  }

  @Get('balance/pdf') @CheckAbility('export','Account')
  async balancePdf(@Query('companyId') companyId: string, @Query('to') to: string, @Res() res: Response) {
    const map = await this.accounting.balance(companyId, to);
    const html = this.svc.balanceReport(map, to);
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="balance.pdf"'); res.send(pdf);
  }

  @Get('statements/:counterpartyId/pdf') @CheckAbility('export','Account')
  async statementPdf(@Query('companyId') companyId: string, @Param('counterpartyId') counterpartyId: string, @Query('to') to: string, @Res() res: Response) {
    const cp = await this.prisma.counterparty.findUnique({ where: { id: counterpartyId } });
    const toDate = to ? new Date(to) : new Date();
    const lines = await this.prisma.journalEntryLine.findMany({
      where: { journalEntry: { companyId, date: { lte: toDate } }, counterpartyId },
      include: { account: true, journalEntry: true },
      orderBy: { journalEntry: { date: 'asc' } }
    });
    let saldo = 0;
    const rows = lines.map(l => {
      const debe = (l.account.code.startsWith('12') ? 0 : (l.debit||0)) + (l.account.code.startsWith('21') ? (l.debit||0) : 0);
      const haber = (l.account.code.startsWith('12') ? (l.credit||0) : 0) + (l.account.code.startsWith('21') ? 0 : (l.credit||0));
      saldo += (debe - haber);
      return { fecha: l.journalEntry.date.toISOString().slice(0,10), cuenta: `${l.account.code} ${l.account.name}`, debe, haber, saldo };
    });
    const html = this.svc.statementReport({ name: cp?.name||'', taxId: cp?.taxId||'', rows });
    const pdf = await this.svc.htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="estado_cuenta.pdf"'); res.send(pdf);
  }
