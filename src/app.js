'use strict';

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

const env = require('./config/env');
const { attachUser, requireAuth } = require('./middleware/auth');
const flash = require('./middleware/flash');
const { notFound, errorHandler } = require('./middleware/errors');
const metrics = require('./middleware/metrics');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/suppliers');
const stockRoutes = require('./routes/stock');
const movementRoutes = require('./routes/movements');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(express.json({ limit: '256kb' }));

app.use(metrics.trackRequest);

app.use(
  cookieSession({
    name: 'kho.sid',
    keys: [env.sessionSecret],
    maxAge: 8 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure
  })
);

app.use(flash);
app.use(attachUser);

// Tài nguyên tĩnh: font, icon, chart.js đã được copy vào public/vendor
app.use(
  '/assets',
  express.static(path.join(__dirname, '..', 'public', 'vendor'), {
    maxAge: env.nodeEnv === 'production' ? '7d' : 0,
    fallthrough: true
  })
);
app.use(
  '/static',
  express.static(path.join(__dirname, '..', 'public'), { maxAge: env.nodeEnv === 'production' ? '7d' : 0 })
);

app.get('/health', async (req, res) => {
  const db = require('./config/db');
  try {
    await db.ping();
    metrics.trackDbQuery();
    res.json({ status: 'ok', db: 'up', app: env.appName, time: new Date().toISOString() });
  } catch (err) {
    metrics.trackDbError();
    res.status(503).json({ status: 'error', db: 'down', message: err.message });
  }
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics.render());
});

app.use('/auth', authRoutes);
app.use('/', requireAuth, dashboardRoutes);
app.use('/products', requireAuth, productRoutes);
app.use('/suppliers', requireAuth, supplierRoutes);
app.use('/stock', requireAuth, stockRoutes);
app.use('/movements', requireAuth, movementRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
