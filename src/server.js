'use strict';

const env = require('./config/env');
const app = require('./app');
const db = require('./config/db');

async function start() {
  try {
    await db.ping();
    console.log(`[db] kết nối thành công ${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (err) {
    console.error(`[db] KHÔNG kết nối được: ${err.message}`);
  }

  app.listen(env.port, env.host, () => {
    console.log(`[web] ${env.appName} chạy tại http://${env.host}:${env.port} (${env.nodeEnv})`);
  });
}

start();
