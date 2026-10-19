'use strict';

const express = require('express');
const catalog = require('../repositories/catalog');

const router = express.Router();

function parseForm(body) {
  return {
    code: (body.code || '').trim(),
    name: (body.name || '').trim(),
    email: (body.email || '').trim(),
    phone: (body.phone || '').trim(),
    address: (body.address || '').trim()
  };
}

function validate(data) {
  const errors = {};
  if (!data.code) errors.code = 'Bắt buộc';
  if (!data.name) errors.name = 'Bắt buộc';
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.email = 'Email không đúng định dạng';
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const suppliers = await catalog.listSuppliers({ q });
    return res.render('pages/suppliers', { title: 'Nhà cung cấp', suppliers, filters: { q } });
  } catch (err) {
    return next(err);
  }
});

router.get('/new', (req, res) =>
  res.render('pages/supplier-form', {
    title: 'Thêm nhà cung cấp',
    mode: 'create',
    supplier: null,
    errors: {},
    form: { code: '', name: '', email: '', phone: '', address: '' }
  })
);

router.post('/', async (req, res, next) => {
  try {
    const form = parseForm(req.body);
    const errors = validate(form);
    if (Object.keys(errors).length) {
      return res.status(400).render('pages/supplier-form', {
        title: 'Thêm nhà cung cấp',
        mode: 'create',
        supplier: null,
        errors,
        form: req.body
      });
    }
    await catalog.createSupplier(form);
    req.flash('success', `Đã thêm nhà cung cấp ${form.name}.`);
    return res.redirect('/suppliers');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).render('pages/supplier-form', {
        title: 'Thêm nhà cung cấp',
        mode: 'create',
        supplier: null,
        errors: { code: 'Mã nhà cung cấp đã tồn tại' },
        form: req.body
      });
    }
    return next(err);
  }
});

router.get('/:id/edit', async (req, res, next) => {
  try {
    const supplier = await catalog.getSupplier(req.params.id);
    if (!supplier) return next();
    return res.render('pages/supplier-form', {
      title: `Sửa ${supplier.name}`,
      mode: 'edit',
      supplier,
      errors: {},
      form: {
        code: supplier.code,
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || ''
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id', async (req, res, next) => {
  try {
    const supplier = await catalog.getSupplier(req.params.id);
    if (!supplier) return next();

    const form = parseForm(req.body);
    const errors = validate(form);
    if (Object.keys(errors).length) {
      return res.status(400).render('pages/supplier-form', {
        title: `Sửa ${supplier.name}`,
        mode: 'edit',
        supplier,
        errors,
        form: req.body
      });
    }
    await catalog.updateSupplier(supplier.id, form);
    req.flash('success', `Đã lưu thay đổi cho ${form.name}.`);
    return res.redirect('/suppliers');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).render('pages/supplier-form', {
        title: `Sửa ${supplier.name}`,
        mode: 'edit',
        supplier,
        errors: { code: 'Mã nhà cung cấp đã tồn tại' },
        form: req.body
      });
    }
    return next(err);
  }
});

router.post('/:id/delete', async (req, res, next) => {
  try {
    const supplier = await catalog.getSupplier(req.params.id);
    if (!supplier) return next();
    await catalog.deleteSupplier(supplier.id);
    req.flash('success', `Đã xoá nhà cung cấp ${supplier.name}.`);
    return res.redirect('/suppliers');
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
