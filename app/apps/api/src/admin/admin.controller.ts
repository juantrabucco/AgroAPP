import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PoliciesGuard } from '../casl/policies.guard.js';
import { CheckAbility } from '../casl/check-abilities.decorator.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post('seed/demo') @CheckAbility('manage','Account')
  async seedDemo(@Query('companyId') companyId: string) {
    // Ensure basic accounts
    const ensure = async (code: string, name: string, type: any) => {
      const found = await this.prisma.account.findFirst({ where: { companyId, code } });
      if (!found) await this.prisma.account.create({ data: { companyId, code, name, type } });
    };
    await ensure('1101','Caja','ASSET');
    await ensure('1201','Clientes','ASSET');
    await ensure('2101','Proveedores','LIABILITY');
    await ensure('4001','Ventas de hacienda','REVENUE');
    await ensure('5001','Costo productos','EXPENSE');

    // Items
    const item = await this.prisma.item.upsert({ where: { companyId_name: { companyId, name: 'Ternero' } }, update: {}, create: { companyId, name: 'Ternero', price: 200 } });

    // Counterparties
    const cliente = await this.prisma.counterparty.upsert({ where: { companyId_name: { companyId, name: 'Cliente Demo' } }, update: {}, create: { companyId, type: 'CUSTOMER', name: 'Cliente Demo', taxId: '20-12345678-9' } });
    const proveedor = await this.prisma.counterparty.upsert({ where: { companyId_name: { companyId, name: 'Proveedor Demo' } }, update: {}, create: { companyId, type: 'SUPPLIER', name: 'Proveedor Demo', taxId: '30-98765432-1' } });

    // Field & lot
    const field = await this.prisma.field.upsert({ where: { id: `${companyId}-field-demo` }, update: {}, create: { id: `${companyId}-field-demo`, companyId, name: 'Estancia Demo' } });
    const lot = await this.prisma.lot.upsert({ where: { id: `${companyId}-lot-demo` }, update: {}, create: { id: `${companyId}-lot-demo`, fieldId: field.id, name: 'Lote 1' } });

    // Animals
    for (let i=1;i<=10;i++){
      await this.prisma.animal.upsert({ where: { companyId_tagId: { companyId, tagId: 'D'+String(i).padStart(3,'0') } }, update: {}, create: { companyId, fieldId: field.id, lotId: lot.id, tagId: 'D'+String(i).padStart(3,'0'), species: 'BOVINE', sex: i%2===0?'F':'M' } });
    }

    // Simple sales & purchases
    const sale = await this.prisma.sale.create({ data: { companyId, counterpartyId: cliente.id, date: new Date(), payment: 'ACCOUNT', lines: { create: [{ itemId: item.id, qty: 2, price: 250 }] }, total: 500, invoiceNumber: 'V-00000001' } });
    const purchase = await this.prisma.purchase.create({ data: { companyId, counterpartyId: proveedor.id, date: new Date(), payment: 'ACCOUNT', lines: { create: [{ itemId: item.id, qty: 1, price: 150 }] }, total: 150, invoiceNumber: 'C-00000001' } });

    // Health event
    await this.prisma.healthEvent.create({ data: { companyId, fieldId: field.id, lotId: lot.id, type: 'VACUNACION', dueDate: new Date(Date.now()+3*86400000) } });

    return { ok: true };
  }
}
