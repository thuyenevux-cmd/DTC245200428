'use strict';

const express = require('express');
const stockRepo = require('../repositories/stock');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await stockRepo.dashboardStats();
    return res.render('pages/dashboard', { title: 'Tổng quan', data });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
