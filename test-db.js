import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const packages = await prisma.package.findMany();
    console.log(`✅ Found ${packages.length} packages`);
    
    if (packages.length > 0) {
      console.log('First package:', packages[0]);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
