import { prisma } from '../config/prisma.js';

async function checkLatestLog() {
  const latestLog = await prisma.callLog.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  console.log('✅ PostgreSQL Call Log Record:');
  console.log(JSON.stringify(latestLog, null, 2));
}

checkLatestLog()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
