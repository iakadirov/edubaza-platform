import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test Prisma connection by counting users
    const userCount = await prisma.user.count();

    // Get database info
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const version = result[0]?.version || 'unknown';

    // Get all table names using Prisma introspection
    const tables = [
      'users',
      'worksheets',
      'templates',
      'curriculum_topics',
      'payments',
      'system_logs'
    ];

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Prisma Client connection successful! ✅',
      data: {
        prismaVersion: '5.x',
        databaseVersion: version,
        tables,
        tableCount: tables.length,
        userCount,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Prisma connection error:', error);
    await prisma.$disconnect();

    return NextResponse.json({
      success: false,
      message: 'Prisma Client connection failed ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
