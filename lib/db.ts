// PostgreSQL database connection utility
import { Pool } from 'pg';

// Создаем пул соединений
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'edubaza',
  user: 'edubaza',
  password: 'test123', // Docker container password
});

// Проверяем соединение при первом запуске
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
