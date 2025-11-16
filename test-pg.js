const { Client } = require('pg');

// Try connecting to the localhost postgres (not Docker)
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',  // Default superuser
  password: '',       // Try without password
  database: 'postgres',  // Default database
});

async function test() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('✓ Connected!');

    const res = await client.query('SELECT 1 as num');
    console.log('✓ Query result:', res.rows[0]);

    await client.end();
    console.log('✓ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

test();
