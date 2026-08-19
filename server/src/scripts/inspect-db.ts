import { prisma } from '../config/prisma.js';

async function inspectDatabase() {
  console.log('📊 ========================================================');
  console.log('📊 RECOVERA DATABASE TABLE AUDIT');
  console.log('📊 ========================================================\n');

  const tables: any[] = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('Current Tables in PostgreSQL "recovera":');
  for (const t of tables) {
    const count: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${t.table_name}"`);
    console.log(`  - ${t.table_name.padEnd(25)} : ${count[0].count} rows`);
  }

  await prisma.$disconnect();
}

inspectDatabase().catch(console.error);
