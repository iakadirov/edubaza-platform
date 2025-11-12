/**
 * Prisma Client Singleton
 * Обеспечивает единственный экземпляр Prisma Client для всего приложения
 */

import { PrismaClient } from '@prisma/client';
import { databaseConfig } from '@/shared/config/database.config';

// Расширяем глобальный объект для hot reload в dev режиме
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Создаем Prisma Client с логированием
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: databaseConfig.logging ? ['query', 'error', 'warn'] : ['error'],
  });
};

// В production создаем новый инстанс, в dev используем глобальный (для hot reload)
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;

/**
 * Utility функция для проверки подключения к БД
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
