'use strict';

require('dotenv').config();

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  host: process.env.HOST || '0.0.0.0',
  appName: process.env.APP_NAME || 'Quản lý kho hàng',
  sessionSecret: process.env.SESSION_SECRET || 'doi-mat-khoa-nay-khi-chay-production',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kho_hang',
    connectionLimit: toInt(process.env.DB_POOL_SIZE, 10)
  }
};

if (env.nodeEnv === 'production' && env.sessionSecret.startsWith('doi-mat-khoa')) {
  throw new Error('SESSION_SECRET phải được đặt khi chạy production');
}

module.exports = env;
