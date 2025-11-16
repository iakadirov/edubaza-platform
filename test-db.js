// Load environment variables FIRST
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'Set (' + process.env.DATABASE_URL.length + ' chars)' : 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// THEN import and instantiate Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'error', 'warn']
});

async function test() {
  try {
    await prisma.$connect();
    console.log('✓ Connected to database');

    const count = await prisma.predefinedTask.count();
    console.log('✓ Predefined tasks count:', count);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

test();
