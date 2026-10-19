'use strict';

const express = require('express');
const stockRepo = require('../repositories/stock');
const catalog = require('../repositories/catalog');
const { createDocument, StockError } = require('../services/documents');

const router = express.Router();

/* --------------------------------- Danh sách tồn ------------------------------- */

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = req.query.filter || 'all';
    const page = Number.parseInt(req.query.page, 10) || 1;

    const [result, summary] = await Promise.all([
      stockRepo.listStock({ q, filter, page }),
      stockRepo.stockSummary()
    ]);

    return res.render('pages/stock', {
      title: 'Tồn kho',
      ...result,
      summary,
      filters: { q, filter }
    });
  } catch (err) {
    return next(err);
  }
});

/* --------------------------------- Phiếu nhập hàng ------------------------------ */

router.get('/in', async (req, res, next) => {
  try {
    const [products, suppliers] = await Promise.all([
      catalog.listProducts({ perPage: 500 }),
      catalog.listSuppliers()
    ]);
    return res.render('pages/stock-in', {
      title: 'Nhập hàng',
      mode: 'create',
      products: products.rows,
      suppliers,
      errors: {},
      form: { supplierId: '', note: '' },
      lines: []
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/in', async (req, res, next) => {
  try {
    const lines = parseLines(req.body);
    const supplierId = req.body.supplierId ? Number.parseInt(req.body.supplierId, 10) : null;

    const result = await createDocument({
      type: 'IN',
      supplierId,
      note: (req.body.note || '').trim(),
      lines,
      userId: req.user.id
    });

    req.flash('success', `Đã ghi nhập phiếu ${result.code} (${result.lineCount} dòng hàng).`);
    return res.redirect('/stock');
  } catch (err) {
    if (err instanceof StockError) return res.status(422).render('pages/stock-in', await buildFormState(req, err));
    return next(err);
  }
});

/* --------------------------------- Phiếu xuất hàng ------------------------------ */

router.get('/out', async (req, res, next) => {
  try {
    const [products, suppliers] = await Promise.all([
      catalog.listProducts({ perPage: 500 }),
      catalog.listSuppliers()
    ]);
    return res.render('pages/stock-out', {
      title: 'Xuất hàng',
      mode: 'create',
      products: products.rows,
      suppliers,
      errors: {},
      form: { note: '' },
      lines: []
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/out', async (req, res, next) => {
  try {
    const lines = parseLines(req.body);

    const result = await createDocument({
      type: 'OUT',
      supplierId: null,
      note: (req.body.note || '').trim(),
      lines,
      userId: req.user.id
    });

    req.flash('success', `Đã ghi xuất phiếu ${result.code} (${result.lineCount} dòng hàng).`);
    return res.redirect('/stock');
  } catch (err) {
    if (err instanceof StockError) return res.status(422).render('pages/stock-out', await buildFormState(req, err));
    return next(err);
  }
});

/* ----------------------------------- Helpers ----------------------------------- */

/**
 * Form gửi nhiều dòng: productId[], quantity[], unitPrice[] (mảng cùng độ dài).
 */
function parseLines(body) {
  const ids = toArray(body.productId);
  const quantities = toArray(body.quantity);
  const prices = toArray(body.unitPrice);

  return ids.map((id, index) => ({
    productId: id,
    quantity: quantities[index],
    unitPrice: prices[index]
  }));
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

async function buildFormState(req, err) {
  const [products, suppliers] = await Promise.all([
    catalog.listProducts({ perPage: 500 }),
    catalog.listSuppliers()
  ]);
  const lines = parseLines(req.body).map((l) => ({
    productId: l.productId,
    quantity: l.quantity,
    unitPrice: l.unitPrice
  }));

  return {
    title: 'Nhập hàng',
    mode: 'create',
    products: products.rows,
    suppliers,
    errors: { form: err.message },
    form: { supplierId: req.body.supplierId || '', note: req.body.note || '' },
    lines
  };
}

module.exports = router;
