'use strict';

const express = require('express');
const stockRepo = require('../repositories/stock');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const type = req.query.type || '';
    const from = req.query.from || '';
    const to = req.query.to || '';
    const page = Number.parseInt(req.query.page, 10) || 1;

    const result = await stockRepo.listMovements({
      q,
      type: type || null,
      from: from || null,
      to: to || null,
      page
    });

    return res.render('pages/movements', {
      title: 'Lịch sử giao dịch',
      ...result,
      filters: { q, type, from, to }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
