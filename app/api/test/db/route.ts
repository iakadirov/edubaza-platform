import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  let pool: Pool | null = null;

  try {
    // Create PostgreSQL connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Test connection
    const client = await pool.connect();

    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version;

    // Get table count
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful! ✅',
      data: {
        version,
        tables: tablesResult.rows.map(r => r.table_name),
        tableCount: tablesResult.rows.length,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Database connection error:', error);

    if (pool) {
      await pool.end();
    }

    return NextResponse.json({
      success: false,
      message: 'Database connection failed ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
