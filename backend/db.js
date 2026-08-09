const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || null;

let pool = null;
if (connectionString) {
  pool = new Pool({ connectionString });
  pool.on('error', (err) => console.error('Postgres pool error', err));
} else {
  console.warn('DATABASE_URL not set — Postgres disabled');
}

module.exports = {
  query: (text, params) => {
    if (!pool) return Promise.reject(new Error('Postgres not configured'));
    return pool.query(text, params);
  },
  pool,
};
