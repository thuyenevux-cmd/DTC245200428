'use strict';

/**
 * Áp dụng db/schema.sql (tạo bảng nếu chưa có).
 * Chạy: npm run db:migrate
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function main() {
  const file = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(file, 'utf8');

  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci'
  });

  try {
    await conn.query(sql);
    const [tables] = await conn.query('SHOW TABLES');
    console.log('→ Đã tạo/cập nhật bảng:', tables.map((t) => Object.values(t)[0]).join(', '));
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Lỗi migrate:', err.message);
  process.exit(1);
});
