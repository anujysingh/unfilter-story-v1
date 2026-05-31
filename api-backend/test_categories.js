import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SIGNAL_TYPES = [
  'Funding', 'Startup Launch', 'Acquisition', 'Shutdown', 'Layoffs', 
  'Product News / Launch', 'Founder Story / Profile', 'Pivot', 'Funding Ask', 'Revenue Milestone',
  'Partnership', 'Expansion', 'Regulatory / Policy', 'Leadership / People', 'Legal / Litigation', 'Ecosystem News',
  'Market Insights / Reports', 'Tech Guides / Tutorials', 'Trends / Future Tech', 'Product Review / Opinion',
  'Innovation / Breakthrough'
];

async function run() {
  console.log("=== Category Distribution (Last 3 Months) ===");
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  for (const cat of SIGNAL_TYPES) {
    const count = await prisma.discoveryCache.count({
      where: {
        categories: { contains: cat },
        pubDate: { gte: threeMonthsAgo }
      }
    });
    console.log(`${cat.padEnd(30)} : ${count}`);
  }
}
run().then(() => process.exit(0));
