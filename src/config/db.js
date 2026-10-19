'use strict';

const mysql = require('mysql2/promise');
const env = require('./env');
const metrics = require('../middleware/metrics');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
  dateStrings: ['DATE', 'DATETIME']
});

async function query(sql, params = []) {
  metrics.trackDbQuery();
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    metrics.trackDbError();
    throw err;
  }
}

async function one(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function transaction(handler) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    metrics.trackDbQuery();
    const result = await handler(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    metrics.trackDbError();
    throw err;
  } finally {
    conn.release();
  }
}

async function ping() {
  const row = await one('SELECT 1 AS ok');
  return row && row.ok === 1;
}

module.exports = { pool, query, one, transaction, ping };
