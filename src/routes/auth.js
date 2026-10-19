'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  return res.render('pages/login', { title: 'Đăng nhập', error: null, username: '' });
});

router.post('/login', async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      return res.status(400).render('pages/login', {
        title: 'Đăng nhập',
        error: 'Nhập tên đăng nhập và mật khẩu.',
        username
      });
    }

    const user = await db.one('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    const hash = user ? user.password_hash : '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const ok = await bcrypt.compare(password, hash);

    if (!user || !ok) {
      return res.status(401).render('pages/login', {
        title: 'Đăng nhập',
        error: 'Tên đăng nhập hoặc mật khẩu không đúng.',
        username
      });
    }

    req.session.userId = user.id;
    req.flash('success', `Xin chào ${user.full_name}.`);
    const target = req.session.returnTo || '/';
    delete req.session.returnTo;
    return res.redirect(target);
  } catch (err) {
    return next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/auth/login');
});

module.exports = router;
