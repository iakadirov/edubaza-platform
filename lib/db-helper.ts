import { spawn } from 'child_process';

// Определяем, используем ли Docker или прямое подключение
const USE_DOCKER = process.env.USE_DOCKER_POSTGRES === 'true';
const DB_PASSWORD = process.env.DATABASE_PASSWORD || '9KOcIWiykfNXVZryDSfjnHk2ungrXkzIFkwU';

/**
 * Универсальная функция для выполнения SQL запросов
 * Работает как с Docker (локально), так и с прямым подключением (продакшн)
 * Использует stdin для передачи SQL чтобы избежать проблем с экранированием
 */
export async function executeSql(sql: string, options: { format?: string; fieldSeparator?: string } = {}): Promise<string> {
  const { format = '-t -A', fieldSeparator = '|' } = options;

  return new Promise<string>((resolve, reject) => {
    const formatFlags = format.split(' ');
    const separator = fieldSeparator ? `-F${fieldSeparator}` : '';
    const separatorFlag = separator ? [separator] : [];

    let proc;

    if (USE_DOCKER) {
      // Локальная разработка - PostgreSQL в Docker
      proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', ...formatFlags, ...separatorFlag]);
    } else {
      // Продакшн - PostgreSQL установлен локально
      proc = spawn('psql', ['-h', 'localhost', '-U', 'edubaza', '-d', 'edubaza', ...formatFlags, ...separatorFlag], {
        env: { ...process.env, PGPASSWORD: DB_PASSWORD }
      });
    }

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    // Передаём SQL через stdin
    proc.stdin.write(sql);
    proc.stdin.end();
  });
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
