'use strict';

const currencyFormat = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const numberFormat = new Intl.NumberFormat('vi-VN');

function currency(value) {
  return currencyFormat.format(Number(value) || 0);
}

function number(value) {
  return numberFormat.format(Number(value) || 0);
}

function date(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function dateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function dateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Trạng thái tồn kho: còn hàng / sắp hết / hết hàng. */
function stockStatus(row) {
  const quantity = Number(row.quantity) || 0;
  const reorder = Number(row.reorder_point) || 0;
  if (quantity <= 0) return { key: 'out', label: 'Hết hàng' };
  if (quantity <= reorder) return { key: 'low', label: 'Sắp hết' };
  return { key: 'ok', label: 'Còn hàng' };
}

/** Nhãn loại phiếu. */
function documentType(type) {
  if (type === 'IN') return { key: 'in', label: 'Phiếu nhập' };
  if (type === 'OUT') return { key: 'accent', label: 'Phiếu xuất' };
  return { key: 'neutral', label: 'Điều chỉnh' };
}

function signedQuantity(value) {
  const n = Number(value) || 0;
  return n > 0 ? `+${number(n)}` : number(n);
}

module.exports = { currency, number, date, dateTime, dateInput, stockStatus, documentType, signedQuantity };
