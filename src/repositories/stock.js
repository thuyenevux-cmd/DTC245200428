'use strict';

const db = require('../config/db');

/* ---------------------------------- Tồn kho ---------------------------------- */

const STOCK_SELECT = `
  SELECT p.id, p.sku, p.name, p.unit, p.cost_price, p.sale_price, p.reorder_point,
         c.name AS category_name,
         COALESCE(s.quantity, 0) AS quantity,
         COALESCE(s.committed, 0) AS committed,
         ROUND(COALESCE(s.quantity, 0) * p.cost_price) AS stock_value,
         s.updated_at AS stock_updated_at,
         (SELECT MAX(m.created_at) FROM stock_movements m WHERE m.product_id = p.id) AS last_movement_at,
         (SELECT sup.name FROM stock_documents d
            JOIN suppliers sup ON sup.id = d.supplier_id
           WHERE d.type = 'IN'
             AND d.id IN (SELECT document_id FROM stock_movements WHERE product_id = p.id)
           ORDER BY d.created_at DESC LIMIT 1) AS last_supplier
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN stocks s ON s.product_id = p.id`;

/**
 * filter: 'all' | 'low' | 'out' | 'negative'
 */
async function listStock({ q, filter = 'all', page = 1, perPage = 12 } = {}) {
  const where = [];
  const params = [];

  if (q) {
    where.push('(p.name LIKE ? OR p.sku LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === 'low') {
    where.push('COALESCE(s.quantity, 0) <= p.reorder_point');
  } else if (filter === 'out') {
    where.push('COALESCE(s.quantity, 0) = 0');
  } else if (filter === 'negative') {
    where.push('COALESCE(s.quantity, 0) < 0');
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRow = await db.one(
    `SELECT COUNT(*) AS total FROM products p LEFT JOIN stocks s ON s.product_id = p.id ${clause}`,
    params
  );
  const total = countRow ? countRow.total : 0;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const offset = (current - 1) * perPage;

  const rows = await db.query(`${STOCK_SELECT} ${clause} ORDER BY p.name ASC LIMIT ? OFFSET ?`, [
    ...params,
    perPage,
    offset
  ]);

  return { rows, total, page: current, pages, perPage };
}

async function stockSummary() {
  return db.one(`
    SELECT COUNT(*) AS product_count,
           SUM(COALESCE(s.quantity, 0)) AS total_units,
           ROUND(SUM(COALESCE(s.quantity, 0) * p.cost_price)) AS stock_value,
           SUM(CASE WHEN COALESCE(s.quantity, 0) = 0 THEN 1 ELSE 0 END) AS out_of_stock,
           SUM(CASE WHEN COALESCE(s.quantity, 0) > 0 AND COALESCE(s.quantity, 0) <= p.reorder_point THEN 1 ELSE 0 END) AS low_stock,
           SUM(CASE WHEN COALESCE(s.quantity, 0) < 0 THEN 1 ELSE 0 END) AS negative_stock
      FROM products p
      LEFT JOIN stocks s ON s.product_id = p.id`);
}

/* ------------------------------ Lịch sử biến động ---------------------------- */

async function listMovements({ q, type, from, to, page = 1, perPage = 20 } = {}) {
  const where = [];
  const params = [];

  if (q) {
    where.push('(p.name LIKE ? OR p.sku LIKE ? OR d.code LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (type) {
    where.push('d.type = ?');
    params.push(type);
  }
  if (from) {
    where.push('m.created_at >= ?');
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where.push('m.created_at <= ?');
    params.push(`${to} 23:59:59`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRow = await db.one(
    `SELECT COUNT(*) AS total
       FROM stock_movements m
       JOIN stock_documents d ON d.id = m.document_id
       JOIN products p ON p.id = m.product_id ${clause}`,
    params
  );
  const total = countRow ? countRow.total : 0;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const offset = (current - 1) * perPage;

  const rows = await db.query(
    `SELECT m.id, m.quantity, m.unit_price, m.created_at,
            ROUND(m.quantity * m.unit_price) AS line_value,
            p.id AS product_id, p.sku, p.name AS product_name, p.unit,
            d.id AS document_id, d.code AS document_code, d.type,
            sup.name AS supplier_name
       FROM stock_movements m
       JOIN stock_documents d ON d.id = m.document_id
       JOIN products p ON p.id = m.product_id
       LEFT JOIN suppliers sup ON sup.id = d.supplier_id
       ${clause}
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  return { rows, total, page: current, pages, perPage };
}

/* --------------------------------- Dashboard --------------------------------- */

async function dashboardStats() {
  const summary = await db.one(`
    SELECT COUNT(*) AS product_count,
           SUM(COALESCE(s.quantity, 0)) AS total_units,
           ROUND(SUM(COALESCE(s.quantity, 0) * p.cost_price)) AS stock_value,
           SUM(CASE WHEN COALESCE(s.quantity, 0) > 0 AND COALESCE(s.quantity, 0) <= p.reorder_point THEN 1 ELSE 0 END) AS low_stock,
           SUM(CASE WHEN COALESCE(s.quantity, 0) <= 0 THEN 1 ELSE 0 END) AS out_of_stock
      FROM products p
      LEFT JOIN stocks s ON s.product_id = p.id`);

  const inOut30 = await db.one(`
    SELECT
      COALESCE(SUM(CASE WHEN m.quantity > 0 THEN m.quantity ELSE 0 END), 0) AS units_in,
      COALESCE(SUM(CASE WHEN m.quantity < 0 THEN -m.quantity ELSE 0 END), 0) AS units_out,
      COALESCE(SUM(CASE WHEN m.quantity > 0 THEN m.quantity * m.unit_price ELSE 0 END), 0) AS value_in,
      COALESCE(SUM(CASE WHEN m.quantity < 0 THEN -m.quantity * m.unit_price ELSE 0 END), 0) AS value_out
    FROM stock_movements m
    WHERE m.created_at >= (NOW() - INTERVAL 30 DAY)`);

  const counts30 = await db.one(`
    SELECT
      SUM(CASE WHEN d.type = 'IN' THEN 1 ELSE 0 END) AS documents_in,
      SUM(CASE WHEN d.type = 'OUT' THEN 1 ELSE 0 END) AS documents_out
    FROM stock_documents d
    WHERE d.created_at >= (NOW() - INTERVAL 30 DAY)`);

  const lowStock = await db.query(`
    SELECT p.id, p.sku, p.name, p.unit, p.reorder_point,
           COALESCE(s.quantity, 0) AS quantity,
           GREATEST(1, p.reorder_point * 2 - COALESCE(s.quantity, 0)) AS suggested_qty,
           c.name AS category_name
      FROM products p
      LEFT JOIN stocks s ON s.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
     WHERE COALESCE(s.quantity, 0) <= p.reorder_point
     ORDER BY (p.reorder_point - COALESCE(s.quantity, 0)) DESC, p.name
     LIMIT 8`);

  const byCategory = await db.query(`
    SELECT COALESCE(c.name, 'Chưa phân nhóm') AS category_name,
           ROUND(SUM(COALESCE(s.quantity, 0) * p.cost_price)) AS value,
           COUNT(p.id) AS product_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN stocks s ON s.product_id = p.id
     GROUP BY c.id, c.name
     ORDER BY value DESC`);

  const topProducts = await db.query(`
    SELECT p.id, p.sku, p.name, p.unit,
           COALESCE(s.quantity, 0) AS quantity,
           ROUND(COALESCE(s.quantity, 0) * p.cost_price) AS stock_value
      FROM products p
      LEFT JOIN stocks s ON s.product_id = p.id
     WHERE COALESCE(s.quantity, 0) > 0
     ORDER BY stock_value DESC
     LIMIT 6`);

  const trend = await db.query(`
    SELECT DATE(m.created_at) AS day,
           SUM(CASE WHEN m.quantity > 0 THEN m.quantity ELSE 0 END) AS units_in,
           SUM(CASE WHEN m.quantity < 0 THEN -m.quantity ELSE 0 END) AS units_out
      FROM stock_movements m
     WHERE m.created_at >= (NOW() - INTERVAL 30 DAY)
     GROUP BY DATE(m.created_at)
     ORDER BY day ASC`);

  const recentDocuments = await db.query(`
    SELECT d.id, d.code, d.type, d.total_value, d.created_at,
           (SELECT COUNT(*) FROM stock_movements m WHERE m.document_id = d.id) AS line_count,
           (SELECT GROUP_CONCAT(DISTINCT sup.name ORDER BY sup.name SEPARATOR ', ')
              FROM stock_movements m2
              JOIN suppliers sup ON sup.id = d.supplier_id
             WHERE m2.document_id = d.id) AS supplier_name
      FROM stock_documents d
     ORDER BY d.created_at DESC, d.id DESC
     LIMIT 6`);

  return {
    summary,
    inOut30,
    counts30,
    lowStock,
    byCategory,
    topProducts,
    trend,
    recentDocuments
  };
}

module.exports = { listStock, stockSummary, listMovements, dashboardStats };
