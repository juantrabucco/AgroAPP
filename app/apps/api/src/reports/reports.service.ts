import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ReportsService {
  async htmlToPdf(html: string) {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top:'24px', right:'24px', bottom:'24px', left:'24px' } });
    await browser.close();
    return pdf;
  }

  layout(title: string, body: string) {
    return `
      <html><head><meta charset="utf-8"/><style>
        :root{--c:#1b5e20;--muted:#6b7280}
        body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:0;padding:24px;color:#222}
        h1,h2,h3{margin:0 0 12px 0}
        header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid var(--c);padding-bottom:8px}
        .brand{display:flex;gap:8;align-items:center}
        .logo{width:10px;height:10px;background:var(--c);border-radius:3px;display:inline-block}
        .badge{font-weight:700;color:#fff;background:var(--c);padding:4px 8px;border-radius:8px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px}
        th{background:#f8fafc;text-align:left}
        .right{text-align:right}
        .muted{color:var(--muted)}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8;margin:12px 0}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:8px}
        .k{font-size:11px;color:var(--muted)}
        .v{font-size:18px;font-weight:700}
        .pill{display:inline-block;padding:2px 8px;border-radius:999px;background:#e8f5e9;color:#1b5e20;font-size:11px}
      </style></head><body>
        <header>
          <div class="brand"><span class="logo"></span><h1>${title}</h1></div>
          <span class="badge">Agro</span>
        </header>
        ${body}
      </body></html>`;
  }

  plReport(sum: any, from: string, to: string) {
    const rows = Object.entries(sum.byAccount||{}).map(([k,v]:any)=>`<tr><td>${k}</td><td class="right">${(v as number).toFixed(2)}</td></tr>`).join('');
    const body = `
      <div class="cards">
        <div class="card"><div class="k">Periodo</div><div class="v">${from} – ${to}</div></div>
        <div class="card"><div class="k">Ingresos</div><div class="v">$ ${sum.revenue.toFixed(2)}</div></div>
        <div class="card"><div class="k">Gastos</div><div class="v">$ ${sum.expense.toFixed(2)}</div></div>
        <div class="card"><div class="k">Resultado</div><div class="v">$ ${sum.net.toFixed(2)}</div></div>
      </div>
      <table><thead><tr><th>Cuenta</th><th class="right">Monto</th></tr></thead><tbody>${rows}</tbody></table>`;
    return this.layout('Estado de Resultados', body);
  }

  balanceReport(map: any, to: string) {
    const rows = Object.entries(map.byAccount||{}).map(([k,v]:any)=>`<tr><td>${k}</td><td class="right">${(v as number).toFixed(2)}</td></tr>`).join('');
    const body = `
      <div class="cards">
        <div class="card"><div class="k">A la fecha</div><div class="v">${to}</div></div>
        <div class="card"><div class="k">Activos</div><div class="v">$ ${map.assets.toFixed(2)}</div></div>
        <div class="card"><div class="k">Pasivos</div><div class="v">$ ${map.liabilities.toFixed(2)}</div></div>
        <div class="card"><div class="k">Patrimonio</div><div class="v">$ ${map.equity.toFixed(2)}</div></div>
      </div>
      <div class="pill">Chequeo: ${map.balanceCheck.toFixed(2)}</div>
      <table><thead><tr><th>Cuenta</th><th class="right">Saldo</th></tr></thead><tbody>${rows}</tbody></table>`;
    return this.layout('Balance General', body);
  }

  calendarReport(args: { title: string; meta: string; rows: any[] }) {
    const rowsHtml = args.rows.map(r=>`<tr><td>${r.Fecha}</td><td>${r.Tipo}</td><td>${r.Campo}</td><td>${r.Lote}</td><td class="right">${r.Aplicadas}</td></tr>`).join('');
    const total = args.rows.reduce((s,r)=> s + (r.Aplicadas||0), 0);
    const body = `
      <div class="cards">
        <div class="card"><div class="k">Mes/Campo</div><div class="v">${args.meta}</div></div>
        <div class="card"><div class="k">Eventos</div><div class="v">${args.rows.length}</div></div>
        <div class="card"><div class="k">Aplicaciones</div><div class="v">${total}</div></div>
        <div class="card"><div class="k">Estado</div><div class="v">Planificado/Realizado</div></div>
      </div>
      <table><thead><tr><th>Fecha</th><th>Tipo</th><th>Campo</th><th>Lote</th><th class="right">Aplicadas</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
    return this.layout(args.title, body);
  }

  sale(invoice: any) {
    const lines = invoice.lines || [];
    const rows = lines.map((l: any) => `<tr><td>${l.item?.name||l.animalId||''}</td><td class="right">${l.qty||1}</td><td class="right">${l.price?.toFixed(2)||'0.00'}</td><td class="right">${(l.qty*l.price).toFixed(2)}</td></tr>`).join('');
    const total = lines.reduce((s: number, l: any) => s + (l.qty*l.price), 0);
    const body = `
      <div class="grid">
        <div class="box"><h3>Cliente</h3><div>${invoice.counterparty?.name||'-'}</div><div class="muted">${invoice.counterparty?.taxId||''}</div></div>
        <div class="box"><h3>Comprobante</h3><div>Fecha: ${new Date(invoice.date).toLocaleDateString()}</div><div># ${invoice.invoiceNumber||invoice.id}</div></div>
      </div>
      <table><thead><tr><th>Concepto</th><th class="right">Cant.</th><th class="right">Precio</th><th class="right">Importe</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th colspan="3" class="right">Total</th><th class="right">${total.toFixed(2)}</th></tr></tfoot></table>
      <p class="muted">Generado por Agro Starter</p>`;
    return this.layout('Factura de Venta', body);
  }

  purchase(doc: any) {
    const lines = doc.lines || [];
    const rows = lines.map((l: any) => `<tr><td>${l.item?.name||''}</td><td class="right">${l.qty||1}</td><td class="right">${l.price?.toFixed(2)||'0.00'}</td><td class="right">${(l.qty*l.price).toFixed(2)}</td></tr>`).join('');
    const total = lines.reduce((s: number, l: any) => s + (l.qty*l.price), 0);
    const body = `
      <div class="grid">
        <div class="box"><h3>Proveedor</h3><div>${doc.counterparty?.name||'-'}</div><div class="muted">${doc.counterparty?.taxId||''}</div></div>
        <div class="box"><h3>Comprobante</h3><div>Fecha: ${new Date(doc.date).toLocaleDateString()}</div><div># ${doc.invoiceNumber||doc.id}</div></div>
      </div>
      <table><thead><tr><th>Concepto</th><th class="right">Cant.</th><th class="right">Precio</th><th class="right">Importe</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th colspan="3" class="right">Total</th><th class="right">${total.toFixed(2)}</th></tr></tfoot></table>
      <p class="muted">Generado por Agro Starter</p>`;
    return this.layout('Comprobante de Compra', body);
  }

  health(app: any) {
    const body = `
      <div class="grid">
        <div class="box"><h3>Campo/Lote</h3><div>Campo: ${app.field?.name||'-'}</div><div>Lote: ${app.lot?.name||'-'}</div></div>
        <div class="box"><h3>Aplicación</h3><div>Fecha: ${new Date(app.date).toLocaleDateString()}</div><div>Producto: ${app.product||'-'}</div><div>Dosis: ${app.dose||'-'}</div><div>Costo: $ ${(app.cost||0).toFixed(2)}</div></div>
      </div>
      ${app.animal ? `<div class="box" style="margin-top:8px"><div>Animal: ${app.animal.tagId} (${app.animal.species})</div></div>` : ''}
      <p class="muted">Responsable: ${app.responsibleUserId || '-'}</p>`;
    return this.layout('Aplicación Sanitaria', body);
  }
}

  statementReport(args: { name: string; taxId?: string; rows: Array<{ fecha: string; cuenta: string; debe: number; haber: number; saldo: number }>; }) {
    const bodyRows = args.rows.map(r => `<tr><td>${r.fecha}</td><td>${r.cuenta}</td><td class="right">${r.debe.toFixed(2)}</td><td class="right">${r.haber.toFixed(2)}</td><td class="right">${r.saldo.toFixed(2)}</td></tr>`).join('');
    const totalDebe = args.rows.reduce((s,r)=>s+r.debe,0);
    const totalHaber = args.rows.reduce((s,r)=>s+r.haber,0);
    const lastSaldo = args.rows.length? args.rows[args.rows.length-1].saldo : 0;
    const body = `
      <div class="cards">
        <div class="card"><div class="k">Contraparte</div><div class="v">${args.name}</div></div>
        <div class="card"><div class="k">Tax ID</div><div class="v">${args.taxId||''}</div></div>
        <div class="card"><div class="k">Movimientos</div><div class="v">${args.rows.length}</div></div>
        <div class="card"><div class="k">Saldo</div><div class="v">$ ${lastSaldo.toFixed(2)}</div></div>
      </div>
      <table><thead><tr><th>Fecha</th><th>Cuenta</th><th class="right">Debe</th><th class="right">Haber</th><th class="right">Saldo</th></tr></thead><tbody>${bodyRows}</tbody><tfoot><tr><th colspan="2">Totales</th><th class="right">${totalDebe.toFixed(2)}</th><th class="right">${totalHaber.toFixed(2)}</th><th class="right">${lastSaldo.toFixed(2)}</th></tr></tfoot></table>`;
    return this.layout('Estado de Cuenta', body);
  }
