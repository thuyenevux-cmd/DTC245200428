'use strict';

const db = require('../config/db');

/* ---------------------------------- Nhóm hàng --------------------------------- */

async function listCategories() {
  return db.query(
    `SELECT c.id, c.name, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.name`
  );
}

/* -------------------------------- Nhà cung cấp -------------------------------- */

async function listSuppliers({ q } = {}) {
  const where = [];
  const params = [];
  if (q) {
    where.push('(s.name LIKE ? OR s.code LIKE ? OR s.email LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return db.query(
    `SELECT s.id, s.code, s.name, s.email, s.phone, s.address,
            COUNT(DISTINCT p.id) AS product_count,
            (SELECT COUNT(*) FROM stock_documents d WHERE d.supplier_id = s.id) AS document_count
       FROM suppliers s
       LEFT JOIN products p ON p.id IN (SELECT product_id FROM stock_movements WHERE document_id IN
              (SELECT id FROM stock_documents WHERE supplier_id = s.id))
       ${clause}
      GROUP BY s.id, s.code, s.name, s.email, s.phone, s.address
      ORDER BY s.name`,
    params
  );
}

async function getSupplier(id) {
  return db.one('SELECT * FROM suppliers WHERE id = ? LIMIT 1', [id]);
}

async function createSupplier(data) {
  const result = await db.query(
    'INSERT INTO suppliers (code, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
    [data.code, data.name, data.email || null, data.phone || null, data.address || null]
  );
  return result.insertId;
}

async function updateSupplier(id, data) {
  await db.query('UPDATE suppliers SET code = ?, name = ?, email = ?, phone = ?, address = ? WHERE id = ?', [
    data.code,
    data.name,
    data.email || null,
    data.phone || null,
    data.address || null,
    id
  ]);
}

async function deleteSupplier(id) {
  await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
}

/* ---------------------------------- Sản phẩm --------------------------------- */

const PRODUCT_SELECT = `
  SELECT p.id, p.sku, p.name, p.category_id, c.name AS category_name, p.unit,
         p.cost_price, p.sale_price, p.reorder_point,
         COALESCE(s.quantity, 0) AS quantity,
         COALESCE(s.updated_at, p.updated_at) AS stock_updated_at,
         ROUND(COALESCE(s.quantity, 0) * p.cost_price) AS stock_value
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN stocks s ON s.product_id = p.id`;

async function listProducts({ q, categoryId, page = 1, perPage = 12, sort = 'name' } = {}) {
  const where = [];
  const params = [];

  if (q) {
    where.push('(p.name LIKE ? OR p.sku LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (categoryId) {
    where.push('p.category_id = ?');
    params.push(categoryId);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sortable = {
    name: 'p.name',
    sku: 'p.sku',
    quantity: 'quantity',
    value: 'stock_value',
    price: 'p.cost_price'
  };
  const orderBy = sortable[sort] || sortable.name;

  const countRow = await db.one(
    `SELECT COUNT(*) AS total FROM products p LEFT JOIN stocks s ON s.product_id = p.id ${clause}`,
    params
  );
  const total = countRow ? countRow.total : 0;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const offset = (current - 1) * perPage;

  const rows = await db.query(
    `${PRODUCT_SELECT} ${clause} ORDER BY ${orderBy} ASC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  return { rows, total, page: current, pages, perPage };
}

async function getProduct(id) {
  return db.one(`${PRODUCT_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
}

async function createProduct(data) {
  const result = await db.query(
    `INSERT INTO products (sku, name, category_id, unit, cost_price, sale_price, reorder_point)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.sku,
      data.name,
      data.categoryId || null,
      data.unit || 'cái',
      data.costPrice,
      data.salePrice,
      data.reorderPoint
    ]
  );
  await db.query('INSERT INTO stocks (product_id, quantity) VALUES (?, 0) ON DUPLICATE KEY UPDATE product_id = product_id', [
    result.insertId
  ]);
  return result.insertId;
}

async function updateProduct(id, data) {
  await db.query(
    `UPDATE products
        SET sku = ?, name = ?, category_id = ?, unit = ?, cost_price = ?, sale_price = ?, reorder_point = ?
      WHERE id = ?`,
    [
      data.sku,
      data.name,
      data.categoryId || null,
      data.unit || 'cái',
      data.costPrice,
      data.salePrice,
      data.reorderPoint,
      id
    ]
  );
}

async function deleteProduct(id) {
  await db.query('DELETE FROM products WHERE id = ?', [id]);
}

module.exports = {
  listCategories,
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
