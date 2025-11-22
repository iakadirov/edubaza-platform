import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Определяем, используем ли Docker или прямое подключение
const USE_DOCKER = process.env.USE_DOCKER_POSTGRES === 'true';
const DB_PASSWORD = process.env.DATABASE_PASSWORD || '9KOcIWiykfNXVZryDSfjnHk2ungrXkzIFkwU';

/**
 * Универсальная функция для выполнения SQL запросов
 * Работает как с Docker (локально), так и с прямым подключением (продакшн)
 */
export async function executeSql(sql: string, options: { format?: string; fieldSeparator?: string } = {}): Promise<string> {
  const { format = '-t -A', fieldSeparator = '|' } = options;

  let command: string;

  if (USE_DOCKER) {
    // Локальная разработка - PostgreSQL в Docker
    const separator = fieldSeparator ? `-F"${fieldSeparator}"` : '';
    command = `docker exec edubaza_postgres psql -U edubaza -d edubaza ${format} ${separator} -c "${sql}"`;
  } else {
    // Продакшн - PostgreSQL установлен локально
    const separator = fieldSeparator ? `-F"${fieldSeparator}"` : '';
    command = `PGPASSWORD='${DB_PASSWORD}' psql -h localhost -U edubaza -d edubaza ${format} ${separator} -c "${sql}"`;
  }

  const { stdout } = await execAsync(command);
  return stdout;
}

/**
 * Выполнить SQL из временного файла (для безопасного экранирования спецсимволов)
 */
export async function executeSqlFromFile(sql: string, options: { format?: string; fieldSeparator?: string } = {}): Promise<string> {
  const { format = '-t -A', fieldSeparator = '|' } = options;
  const tmpFile = `/tmp/query_${Date.now()}.sql`;

  // Создаем временный SQL файл
  await execAsync(`cat > ${tmpFile} << 'EOFSQL'\n${sql}\nEOFSQL`);

  let command: string;

  if (USE_DOCKER) {
    // Локальная разработка - PostgreSQL в Docker
    const separator = fieldSeparator ? `-F"${fieldSeparator}"` : '';
    command = `docker exec -i edubaza_postgres psql -U edubaza -d edubaza ${format} ${separator} -f ${tmpFile}`;
  } else {
    // Продакшн - PostgreSQL установлен локально
    const separator = fieldSeparator ? `-F"${fieldSeparator}"` : '';
    command = `PGPASSWORD='${DB_PASSWORD}' psql -h localhost -U edubaza -d edubaza ${format} ${separator} -f ${tmpFile}`;
  }

  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } finally {
    // Удаляем временный файл
    await execAsync(`rm -f ${tmpFile}`).catch(() => {});
  }
}
