'use strict';

const db = require('../config/db');

async function attachUser(req, res, next) {
  req.user = null;
  const id = req.session && req.session.userId;
  if (id) {
    try {
      const user = await db.one('SELECT id, username, full_name, role FROM users WHERE id = ? LIMIT 1', [id]);
      req.user = user || null;
    } catch (err) {
      req.user = null;
    }
  }
  res.locals.currentUser = req.user;
  res.locals.appName = require('../config/env').appName;
  res.locals.currentPath = (req.originalUrl || req.url).split('?')[0];
  res.locals.currentQuery = req.query || {};
  res.locals.format = require('../utils/format');
  next();
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.method === 'GET') {
    req.session.returnTo = req.originalUrl;
  }
  return res.redirect('/auth/login');
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) return next();
    return res.status(403).render('pages/error', {
      title: 'Không đủ quyền',
      status: 403,
      message: 'Tài khoản của bạn không được phép thực hiện thao tác này.'
    });
  };
}

module.exports = { attachUser, requireAuth, requireRole };
