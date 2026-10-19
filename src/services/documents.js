'use strict';

const db = require('../config/db');
const metrics = require('../middleware/metrics');

const PREFIX = { IN: 'NH', OUT: 'XH', ADJUST: 'ADJ' };

class StockError extends Error {
  constructor(message, details) {
    super(message);
    this.status = 422;
    this.details = details;
    this.expose = true;
  }
}

async function nextCode(conn, type) {
  const prefix = PREFIX[type];
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

  const [rows] = await conn.execute(
    'SELECT code FROM stock_documents WHERE code LIKE ? ORDER BY id DESC LIMIT 1',
    [pattern]
  );
  let next = 1;
  if (rows.length) {
    const tail = rows[0].code.split('-').pop();
    const parsed = Number.parseInt(tail, 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
}

/**
 * Tạo phiếu nhập / phiếu xuất và cập nhật tồn kho trong cùng một transaction.
 * Mọi dòng đều được ghi vào sổ kho (stock_movements) — không có cách nào
 * đổi tồn mà không có dấu vết.
 */
async function createDocument({ type, supplierId, note, lines, userId }) {
  if (!PREFIX[type]) throw new StockError('Loại phiếu không hợp lệ.');
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new StockError('Phiếu phải có ít nhất một dòng hàng.');
  }

  const cleaned = lines
    .map((l) => ({
      productId: Number.parseInt(l.productId, 10),
      quantity: Number.parseInt(l.quantity, 10),
      unitPrice: l.unitPrice === undefined || l.unitPrice === '' ? null : Number.parseFloat(l.unitPrice)
    }))
    .filter((l) => Number.isFinite(l.productId) && Number.isFinite(l.quantity) && l.quantity > 0);

  if (cleaned.length === 0) {
    throw new StockError('Chưa nhập số lượng ở dòng nào.');
  }

  // Gộp các dòng trùng mã hàng.
  const merged = new Map();
  for (const line of cleaned) {
    const key = line.productId;
    const current = merged.get(key);
    if (current) {
      current.quantity += line.quantity;
      if (line.unitPrice !== null) current.unitPrice = line.unitPrice;
    } else {
      merged.set(key, { ...line });
    }
  }
  const items = [...merged.values()];

  return db.transaction(async (conn) => {
    const ids = items.map((i) => i.productId);
    const placeholders = ids.map(() => '?').join(', ');

    const [products] = await conn.execute(
      `SELECT id, sku, name, unit, cost_price FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
      ids
    );
    if (products.length !== items.length) {
      throw new StockError('Có dòng hàng không còn tồn tại trong danh mục.');
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    const [stockRows] = await conn.execute(
      `SELECT product_id, quantity FROM stocks WHERE product_id IN (${placeholders}) FOR UPDATE`,
      ids
    );
    const stockMap = new Map(stockRows.map((r) => [r.product_id, r.quantity]));

    if (type === 'OUT') {
      const shortages = [];
      for (const item of items) {
        const product = productMap.get(item.productId);
        const current = stockMap.get(item.productId) || 0;
        if (current < item.quantity) {
          shortages.push({ sku: product.sku, name: product.name, current, requested: item.quantity });
        }
      }
      if (shortages.length) {
        throw new StockError(
          'Tồn kho không đủ để xuất: ' +
            shortages.map((s) => `${s.sku} (còn ${s.current}, cần ${s.requested})`).join(', '),
          { shortages }
        );
      }
    }

    const code = await nextCode(conn, type);
    const totalValue = items.reduce((sum, i) => {
      const price = i.unitPrice !== null ? i.unitPrice : productMap.get(i.productId).cost_price;
      return sum + price * i.quantity;
    }, 0);

    const [docResult] = await conn.execute(
      'INSERT INTO stock_documents (code, type, supplier_id, note, user_id, total_value) VALUES (?, ?, ?, ?, ?, ?)',
      [code, type, supplierId || null, note || null, userId || null, totalValue]
    );
    const documentId = docResult.insertId;

    for (const item of items) {
      const product = productMap.get(item.productId);
      const price = item.unitPrice !== null ? item.unitPrice : product.cost_price;
      const signed = type === 'OUT' ? -item.quantity : item.quantity;

      metrics.trackDbQuery();
      await conn.execute(
        'INSERT INTO stock_movements (document_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [documentId, item.productId, signed, price]
      );
      metrics.trackDbQuery();
      await conn.execute(
        'UPDATE stocks SET quantity = GREATEST(0, quantity + ?) WHERE product_id = ?',
        [signed, item.productId]
      );
    }

    return { id: documentId, code, totalValue, lineCount: items.length };
  })
    .then((result) => {
      require('../middleware/metrics').trackStockAdjustment(type);
      return result;
    });
}

module.exports = { createDocument, StockError };
