'use strict';

/**
 * Nạp dữ liệu mẫu: 1 tài khoản quản trị, 8 nhóm hàng, 6 nhà cung cấp,
 * 24 mã hàng và ~30 ngày phiếu nhập / phiếu xuất để dashboard có số liệu thật.
 *
 * Chạy: npm run db:seed
 */

const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const ADMIN_USER = process.env.SEED_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.SEED_ADMIN_PASSWORD || 'Kho@2026';
const ADMIN_NAME = 'Vũ Ngọc Anh Thuyên';

const CATEGORIES = [
  'Điện tử',
  'Văn phòng',
  'Dụng cụ bảo dưỡng',
  'Vệ sinh',
  'Bao bì',
  'Thiết bị bếp',
  'Linh kiện máy tính',
  'Đồ gia dụng'
];

const SUPPLIERS = [
  { code: 'NCC001', name: 'Công ty TNHH Thương mại Hồng Phát', email: 'sales@hongphat.vn', phone: '0903 218 445', address: 'Số 12, đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh' },
  { code: 'NCC002', name: 'Công ty TNHH Thiết bị công nghiệp Việt Thắng', email: 'contact@vietthang.com.vn', phone: '0912 774 120', address: 'Lô 7, KCN Tân Thuận, Quận 7, TP. Hồ Chí Minh' },
  { code: 'NCC003', name: 'Nhà phân phối giấy vở Phương Minh', email: 'phuongminh.paper@gmail.com', phone: '0938 556 002', address: '128 Hàm Nghi, Quận 1, TP. Hồ Chí Minh' },
  { code: 'NCC004', name: 'Công ty Cổ phần Dụng cụ Đông Nam', email: 'info@dongnamtools.vn', phone: '0965 338 771', address: 'Đường số 8, KCN Tân Bình, TP. Hồ Chí Minh' },
  { code: 'NCC005', name: 'Công ty TNHH Bao bì Đại Lộc', email: 'baobidailoc@dailoc.vn', phone: '0908 665 330', address: 'Km 12, Quốc lộ 1A, huyện Bình Chánh, TP. Hồ Chí Minh' },
  { code: 'NCC006', name: 'Công ty TNHH Hóa mỹ phẩm Sài Gòn', email: 'cs@sgcosmetic.vn', phone: '0899 411 208', address: '34 Bùi Viện, Quận 1, TP. Hồ Chí Minh' }
];

const PRODUCTS = [
  { sku: 'DT-0012', name: 'Máy in nhiệt KM-80', cat: 'Điện tử', unit: 'cái', cost: 1250000, sale: 1690000, reorder: 8 },
  { sku: 'DT-0021', name: 'Máy quét mã vạch 2D', cat: 'Điện tử', unit: 'cái', cost: 3450000, sale: 4290000, reorder: 4 },
  { sku: 'DT-0034', name: 'Cân điện tử điểm bán hàng', cat: 'Điện tử', unit: 'cái', cost: 2180000, sale: 2690000, reorder: 3 },
  { sku: 'VP-0011', name: 'Giấy A4 80g (thùng 5 ream)', cat: 'Văn phòng', unit: 'thùng', cost: 138000, sale: 175000, reorder: 20 },
  { sku: 'VP-0018', name: 'Bút bi xanh 0.7mm (hộp 12 cây)', cat: 'Văn phòng', unit: 'hộp', cost: 22000, sale: 32000, reorder: 40 },
  { sku: 'VP-0026', name: 'Bìa nhựa A4 10mm (hộp 10)', cat: 'Văn phòng', unit: 'hộp', cost: 96000, sale: 129000, reorder: 12 },
  { sku: 'VP-0033', name: 'Bộ lưu trữ hồ sơ 3 ngăn', cat: 'Văn phòng', unit: 'bộ', cost: 54000, sale: 79000, reorder: 15 },
  { sku: 'DB-0007', name: 'Bộ dụng cụ vặn ẩn 12 chiếc', cat: 'Dụng cụ bảo dưỡng', unit: 'bộ', cost: 186000, sale: 245000, reorder: 10 },
  { sku: 'DB-0015', name: 'Kìm cắt dây điện 8 inch', cat: 'Dụng cụ bảo dưỡng', unit: 'cái', cost: 78000, sale: 109000, reorder: 12 },
  { sku: 'DB-0023', name: 'Dao gọt dây điện + dao cắt', cat: 'Dụng cụ bảo dưỡng', unit: 'bộ', cost: 64000, sale: 95000, reorder: 14 },
  { sku: 'DB-0031', name: 'Dây điện đỏ 2.5mm (cuộn 100m)', cat: 'Dụng cụ bảo dưỡng', unit: 'cuộn', cost: 1120000, sale: 1390000, reorder: 6 },
  { sku: 'VS-0004', name: 'Nước rửa sàn chuyên dụng 5L', cat: 'Vệ sinh', unit: 'can', cost: 62000, sale: 85000, reorder: 25 },
  { sku: 'VS-0012', name: 'Khăn microfibre 30×30cm (10 chiếc)', cat: 'Vệ sinh', unit: 'bó', cost: 48000, sale: 70000, reorder: 18 },
  { sku: 'VS-0020', name: 'Bột giặt công nghiệp 10kg', cat: 'Vệ sinh', unit: 'bao', cost: 175000, sale: 225000, reorder: 12 },
  { sku: 'VS-0029', name: 'Thùng rác nhựa 60L', cat: 'Vệ sinh', unit: 'cái', cost: 165000, sale: 219000, reorder: 6 },
  { sku: 'BB-0003', name: 'Thùng carton 40×30×30cm (50 chiếc)', cat: 'Bao bì', unit: 'lô', cost: 240000, sale: 310000, reorder: 10 },
  { sku: 'BB-0010', name: 'Băng keo trong 48mm (6 cuộn)', cat: 'Bao bì', unit: 'lô', cost: 78000, sale: 99000, reorder: 15 },
  { sku: 'BB-0019', name: 'Màng co stretch 500mm (2kg)', cat: 'Bao bì', unit: 'cuộn', cost: 118000, sale: 149000, reorder: 10 },
  { sku: 'BB-0027', name: 'Dây đai PP 12mm (1000m)', cat: 'Bao bì', unit: 'cuộn', cost: 210000, sale: 265000, reorder: 8 },
  { sku: 'BT-0005', name: 'Bếp gas âm 2 bếp', cat: 'Thiết bị bếp', unit: 'cái', cost: 1450000, sale: 1890000, reorder: 4 },
  { sku: 'BT-0013', name: 'Nồi hấp điện 5L', cat: 'Thiết bị bếp', unit: 'cái', cost: 680000, sale: 880000, reorder: 5 },
  { sku: 'BT-0021', name: 'Bình giữ nhiệt Inox 1.5L', cat: 'Thiết bị bếp', unit: 'cái', cost: 235000, sale: 315000, reorder: 10 },
  { sku: 'MT-0006', name: 'Ổ cứng SSD 512GB', cat: 'Linh kiện máy tính', unit: 'cái', cost: 1780000, sale: 2150000, reorder: 5 },
  { sku: 'MT-0014', name: 'RAM DDR4 8GB 2666MHz', cat: 'Linh kiện máy tính', unit: 'cái', cost: 690000, sale: 850000, reorder: 8 },
  { sku: 'MT-0022', name: 'Bàn phím cơ không dây', cat: 'Linh kiện máy tính', unit: 'cái', cost: 1280000, sale: 1590000, reorder: 5 },
  { sku: 'MT-0030', name: 'Màn hình 24 inch IPS', cat: 'Linh kiện máy tính', unit: 'cái', cost: 3450000, sale: 4190000, reorder: 3 },
  { sku: 'GD-0008', name: 'Nồi cơ điện 1.8L', cat: 'Đồ gia dụng', unit: 'cái', cost: 720000, sale: 950000, reorder: 6 },
  { sku: 'GD-0016', name: 'Bàn ủi hơi nước', cat: 'Đồ gia dụng', unit: 'cái', cost: 890000, sale: 1150000, reorder: 5 }
];

// Bộ sinh số ngẫu nhiên có hạt giống cố định để dữ liệu mẫu tái lập được.
let seed = 20261019;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (list) => list[Math.floor(rand() * list.length)];

function isoDaysAgo(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, randInt(0, 59), randInt(0, 59), 0);
  return d;
}

async function main() {
  console.log('→ Xoá dữ liệu cũ...');
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ['stock_movements', 'stock_documents', 'stocks', 'products', 'suppliers', 'categories', 'users']) {
    await db.query(`TRUNCATE TABLE ${t}`);
  }
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('→ Người dùng...');
  const hash = bcrypt.hashSync(ADMIN_PASS, 10);
  await db.query('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)', [ADMIN_USER, hash, ADMIN_NAME, 'admin']);

  console.log('→ Nhóm hàng...');
  const catIds = new Map();
  for (const name of CATEGORIES) {
    const r = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    catIds.set(name, r.insertId);
  }

  console.log('→ Nhà cung cấp...');
  const supIds = [];
  for (const s of SUPPLIERS) {
    const r = await db.query(
      'INSERT INTO suppliers (code, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [s.code, s.name, s.email, s.phone, s.address]
    );
    supIds.push(r.insertId);
  }

  console.log('→ Sản phẩm...');
  const productIds = [];
  for (const p of PRODUCTS) {
    const r = await db.query(
      'INSERT INTO products (sku, name, category_id, unit, cost_price, sale_price, reorder_point) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p.sku, p.name, catIds.get(p.cat) || null, p.unit, p.cost, p.sale, p.reorder]
    );
    productIds.push(r.insertId);
    await db.query('INSERT INTO stocks (product_id, quantity) VALUES (?, 0)', [r.insertId]);
  }

  console.log('→ Sinh phiếu nhập / phiếu xuất trong 30 ngày...');
  const stock = new Map(productIds.map((id) => [id, 0]));
  const counters = { IN: 0, OUT: 0, ADJUST: 0 };
  let docCount = 0;

  for (let day = 30; day >= 1; day -= 1) {
    const docsToday = randInt(1, 3);
    for (let d = 0; d < docsToday; d += 1) {
      const type = rand() > 0.45 ? 'IN' : 'OUT';
      const hour = randInt(7, 18);
      const createdAt = isoDaysAgo(day, hour);
      const supplierId = type === 'IN' ? pick(supIds) : null;
      const code = `${type === 'IN' ? 'NH' : 'XH'}-${createdAt.getFullYear()}-${String(++counters[type]).padStart(4, '0')}`;
      const lines = randInt(1, 4);
      const chosen = new Set();
      const docLines = [];

      for (let i = 0; i < lines; i += 1) {
        const pid = pick(productIds);
        if (chosen.has(pid)) continue;
        chosen.add(pid);
        const product = PRODUCTS[productIds.indexOf(pid)];
        const qty = type === 'IN' ? randInt(10, 60) : randInt(3, 25);
        docLines.push({ pid, qty, price: product.cost });
      }
      if (docLines.length === 0) continue;

      const total = docLines.reduce((sum, l) => sum + l.qty * l.price, 0);
      const doc = await db.query(
        'INSERT INTO stock_documents (code, type, supplier_id, note, user_id, total_value, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [code, type, supplierId, null, total, createdAt]
      );

      for (const line of docLines) {
        const signed = type === 'IN' ? line.qty : -line.qty;
        await db.query(
          'INSERT INTO stock_movements (document_id, product_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?)',
          [doc.insertId, line.pid, signed, line.price, createdAt]
        );
        stock.set(line.pid, stock.get(line.pid) + signed);
      }
      docCount += 1;
    }
  }

  // Điều chỉnh: vài phiếu sửa chênh lệch kiểm kê, có ghi chú rõ lý do.
  for (let i = 0; i < 4; i += 1) {
    const pid = pick(productIds);
    const product = PRODUCTS[productIds.indexOf(pid)];
    const createdAt = isoDaysAgo(randInt(2, 20), randInt(8, 17));
    const code = `ADJ-${createdAt.getFullYear()}-${String(++counters.ADJUST).padStart(4, '0')}`;
    const delta = randInt(2, 9) * (rand() > 0.5 ? 1 : -1);
    const doc = await db.query(
      'INSERT INTO stock_documents (code, type, note, user_id, total_value, created_at) VALUES (?, ?, ?, 1, 0, ?)',
      [code, 'ADJUST', 'Chênh lệch sau kiểm kê định kỳ', createdAt]
    );
    await db.query(
      'INSERT INTO stock_movements (document_id, product_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?)',
      [doc.insertId, pid, delta, product.cost, createdAt]
    );
    stock.set(pid, Math.max(0, stock.get(pid) + delta));
    docCount += 1;
  }

  console.log('→ Cập nhật tồn kho...');
  for (const [pid, qty] of stock.entries()) {
    await db.query('UPDATE stocks SET quantity = ? WHERE product_id = ?', [Math.max(0, qty), pid]);
  }

  // Tạo tình huống thực tế: một số mã hàng chạm ngưỡng nhập lại, vài mã hàng đã hết.
  console.log('→ Điều chỉnh ngưỡng nhập lại và tạo mã hàng hết hàng...');
  const productIdsList = [...stock.keys()];
  const lowStockIds = [];
  while (lowStockIds.length < 7) {
    const candidate = productIdsList[randInt(0, productIdsList.length - 1)];
    if (!lowStockIds.includes(candidate)) lowStockIds.push(candidate);
  }
  for (const pid of lowStockIds) {
    const current = stock.get(pid) || 0;
    const newPoint = current + randInt(2, 14);
    await db.query('UPDATE products SET reorder_point = ? WHERE id = ?', [newPoint, pid]);
  }

  const outOfStockIds = [];
  while (outOfStockIds.length < 2) {
    const candidate = productIdsList[randInt(0, productIdsList.length - 1)];
    if (!lowStockIds.includes(candidate) && !outOfStockIds.includes(candidate) && (stock.get(candidate) || 0) > 0) {
      outOfStockIds.push(candidate);
    }
  }
  for (const pid of outOfStockIds) {
    const product = PRODUCTS[productIds.indexOf(pid)];
    const current = stock.get(pid) || 0;
    const createdAt = isoDaysAgo(randInt(1, 12), randInt(8, 17));
    const code = `ADJ-${createdAt.getFullYear()}-${String(++counters.ADJUST).padStart(4, '0')}`;
    const doc = await db.query(
      'INSERT INTO stock_documents (code, type, note, user_id, total_value, created_at) VALUES (?, ?, ?, 1, 0, ?)',
      [code, 'ADJUST', 'Kiểm kê thực tế: mã hàng đã hết, chốt tồn về 0', createdAt]
    );
    await db.query(
      'INSERT INTO stock_movements (document_id, product_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?)',
      [doc.insertId, pid, -current, product.cost, createdAt]
    );
    stock.set(pid, 0);
    await db.query('UPDATE stocks SET quantity = 0 WHERE product_id = ?', [pid]);
    docCount += 1;
  }

  const [summary] = await db.query(`
    SELECT (SELECT COUNT(*) FROM products) AS products,
           (SELECT COUNT(*) FROM suppliers) AS suppliers,
           (SELECT COUNT(*) FROM categories) AS categories,
           (SELECT COUNT(*) FROM stock_documents) AS documents,
           (SELECT COUNT(*) FROM stock_movements) AS movements,
           (SELECT SUM(quantity) FROM stocks) AS total_units,
           (SELECT ROUND(SUM(s.quantity * p.cost_price)) FROM stocks s JOIN products p ON p.id = s.product_id) AS stock_value
  `);
  console.log('→ Hoàn tất:', summary);
  console.log(`   Tài khoản: ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log(`   ${docCount} phiếu, ${summary.movements} dòng sổ kho, giá trị tồn ${Number(summary.stock_value).toLocaleString('vi-VN')} đ`);
}

main()
  .then(() => db.pool.end())
  .catch(async (err) => {
    console.error('Lỗi seed:', err.message);
    await db.pool.end();
    process.exit(1);
  });
