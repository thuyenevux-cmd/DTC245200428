'use strict';

/**
 * Chuẩn bị cơ sở dữ liệu khi khởi động container:
 *  - tạo bảng nếu chưa có (idempotent)
 *  - nạp dữ liệu mẫu chỉ khi bảng `products` còn trống
 * Chạy: node scripts/ensure-db.js
 */

const { execFileSync } = require('child_process');
const path = require('path');
const db = require('../src/config/db');

function run(script) {
  execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
}

async function main() {
  console.log('[db] kiểm tra schema...');
  run('migrate.js');

  const row = await db.one('SELECT COUNT(*) AS total FROM products');
  const total = row ? Number(row.total) : 0;

  if (total === 0) {
    console.log('[db] bảng products còn trống — nạp dữ liệu mẫu...');
    run('seed.js');
  } else {
    console.log(`[db] đã có ${total} mã hàng — giữ nguyên dữ liệu.`);
  }
}

main()
  .then(() => db.pool.end())
  .catch((err) => {
    console.error('[db] lỗi chuẩn bị cơ sở dữ liệu:', err.message);
    process.exit(1);
  });
