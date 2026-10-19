'use strict';

const express = require('express');
const catalog = require('../repositories/catalog');

const router = express.Router();

function parseForm(body) {
  return {
    sku: (body.sku || '').trim(),
    name: (body.name || '').trim(),
    categoryId: body.categoryId ? Number.parseInt(body.categoryId, 10) : null,
    unit: (body.unit || 'cái').trim(),
    costPrice: Number.parseFloat(body.costPrice) || 0,
    salePrice: Number.parseFloat(body.salePrice) || 0,
    reorderPoint: Number.parseInt(body.reorderPoint, 10) || 0
  };
}

function validate(data) {
  const errors = {};
  if (!data.sku) errors.sku = 'Bắt buộc';
  if (!data.name) errors.name = 'Bắt buộc';
  if (data.costPrice < 0) errors.costPrice = 'Không được âm';
  if (data.salePrice < 0) errors.salePrice = 'Không được âm';
  if (data.reorderPoint < 0) errors.reorderPoint = 'Không được âm';
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const categoryId = req.query.category ? Number.parseInt(req.query.category, 10) : null;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const sort = req.query.sort || 'name';

    const [result, categories] = await Promise.all([
      catalog.listProducts({ q, categoryId, page, sort }),
      catalog.listCategories()
    ]);

    return res.render('pages/products', {
      title: 'Sản phẩm',
      ...result,
      categories,
      filters: { q, categoryId, sort }
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/new', async (req, res, next) => {
  try {
    const categories = await catalog.listCategories();
    return res.render('pages/product-form', {
      title: 'Thêm sản phẩm',
      mode: 'create',
      product: null,
      categories,
      errors: {},
      form: { sku: '', name: '', categoryId: '', unit: 'cái', costPrice: '', salePrice: '', reorderPoint: '' }
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const form = parseForm(req.body);
    const errors = validate(form);
    const categories = await catalog.listCategories();

    if (Object.keys(errors).length) {
      return res.status(400).render('pages/product-form', {
        title: 'Thêm sản phẩm',
        mode: 'create',
        product: null,
        categories,
        errors,
        form: req.body
      });
    }

    await catalog.createProduct(form);
    req.flash('success', `Đã thêm sản phẩm ${form.sku}.`);
    return res.redirect('/products');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const categories = await catalog.listCategories();
      return res.status(400).render('pages/product-form', {
        title: 'Thêm sản phẩm',
        mode: 'create',
        product: null,
        categories,
        errors: { sku: 'Mã hàng đã tồn tại' },
        form: req.body
      });
    }
    return next(err);
  }
});

router.get('/:id/edit', async (req, res, next) => {
  try {
    const product = await catalog.getProduct(req.params.id);
    if (!product) return next();
    const categories = await catalog.listCategories();
    return res.render('pages/product-form', {
      title: `Sửa ${product.sku}`,
      mode: 'edit',
      product,
      categories,
      errors: {},
      form: {
        sku: product.sku,
        name: product.name,
        categoryId: product.category_id || '',
        unit: product.unit,
        costPrice: product.cost_price,
        salePrice: product.sale_price,
        reorderPoint: product.reorder_point
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id', async (req, res, next) => {
  try {
    const product = await catalog.getProduct(req.params.id);
    if (!product) return next();

    const form = parseForm(req.body);
    const errors = validate(form);
    const categories = await catalog.listCategories();

    if (Object.keys(errors).length) {
      return res.status(400).render('pages/product-form', {
        title: `Sửa ${product.sku}`,
        mode: 'edit',
        product,
        categories,
        errors,
        form: req.body
      });
    }

    await catalog.updateProduct(product.id, form);
    req.flash('success', `Đã lưu thay đổi cho ${form.sku}.`);
    return res.redirect('/products');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const categories = await catalog.listCategories();
      const product = await catalog.getProduct(req.params.id);
      return res.status(400).render('pages/product-form', {
        title: `Sửa ${product.sku}`,
        mode: 'edit',
        product,
        categories,
        errors: { sku: 'Mã hàng đã tồn tại' },
        form: req.body
      });
    }
    return next(err);
  }
});

router.post('/:id/delete', async (req, res, next) => {
  try {
    const product = await catalog.getProduct(req.params.id);
    if (!product) return next();
    await catalog.deleteProduct(product.id);
    req.flash('success', `Đã xoá sản phẩm ${product.sku}.`);
    return res.redirect('/products');
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
