import { PrismaClient, AccountType, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('changeme', 10);
  const company = await prisma.company.create({ data: { name: 'Demo SA' } });
  const user = await prisma.user.create({ data: { email: 'admin@example.com', passwordHash, name: 'Admin' } });
  await prisma.roleAssignment.create({ data: { userId: user.id, companyId: company.id, role: Role.OWNER } });
  const field = await prisma.field.create({ data: { companyId: company.id, name: 'Campo Norte', location: 'Demo' } });

  // Plan de cuentas mínimo
  await prisma.account.createMany({ data: [
    { companyId: company.id, code: '1101', name: 'Caja', type: AccountType.ASSET },
    { companyId: company.id, code: '1201', name: 'Clientes', type: AccountType.ASSET },
    { companyId: company.id, code: '1301', name: 'Insumos', type: AccountType.ASSET },
    { companyId: company.id, code: '2101', name: 'Proveedores', type: AccountType.LIABILITY },
    { companyId: company.id, code: '4101', name: 'Ventas', type: AccountType.REVENUE },
    { companyId: company.id, code: '5101', name: 'Gastos Sanitarios', type: AccountType.EXPENSE },
  ]});

  // Un animal demo
  await prisma.animal.create({ data: {
    companyId: company.id, fieldId: field.id, tagId: 'AR-0001', species: 'BOVINE', sex: 'F'
  }});

  console.log('Seed completo:', { company: company.name, user: user.email });
}

main().catch(e => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
