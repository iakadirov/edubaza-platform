// PostgreSQL database connection utility
import { Pool } from 'pg';

// Создаем пул соединений из DATABASE_URL или отдельных переменных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback на отдельные переменные если DATABASE_URL не задан
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'edubaza',
  user: process.env.DB_USER || 'edubaza',
  password: process.env.DB_PASSWORD || 'test123',
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

export { pool };
export default pool;
