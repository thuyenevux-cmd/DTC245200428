'use strict';

/**
 * Bộ đếm số liệu tối giản, xuất theo định dạng chữ của Prometheus.
 * Cố tình không dùng thư viện: app chỉ cần vài chỉ số, thêm dependency
 * làm image nặng thêm không cần thiết.
 */

const startedAt = Date.now();

const state = {
  httpRequests: new Map(), // "METHOD|route|status" -> số lần
  dbQueries: 0,
  dbErrors: 0,
  stockAdjustments: 0
};

function routeLabel(req) {
  // Dùng pattern của route để tránh cardinality cao (mỗi id là một nhãn riêng).
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return `${base}${req.route.path}`;
  }
  return req.path.replace(/\/[0-9]+/g, '/:id');
}

function trackRequest(req, res, next) {
  res.on('finish', () => {
    const key = `${req.method}|${routeLabel(req)}|${res.statusCode}`;
    state.httpRequests.set(key, (state.httpRequests.get(key) || 0) + 1);
  });
  next();
}

function trackDbQuery() {
  state.dbQueries += 1;
}

function trackDbError() {
  state.dbErrors += 1;
}

function trackStockAdjustment(type) {
  state.stockAdjustments += 1;
}

function render() {
  const lines = [];
  const push = (name, help, type, samples) => {
    lines.push(`# HELP ${name} ${help}`);
    lines.push(`# TYPE ${name} ${type}`);
    for (const [labels, value] of samples) {
      lines.push(`${name}${labels} ${value}`);
    }
  };

  const requestSamples = [];
  for (const [key, value] of state.httpRequests) {
    const [method, route, status] = key.split('|');
    requestSamples.push([
      `{method="${method}",route="${route}",status="${status}"}`,
      value
    ]);
  }
  push('kho_http_requests_total', 'Tổng số yêu cầu HTTP theo method, route và mã trạng thái.', 'counter', requestSamples);

  push('kho_db_queries_total', 'Tổng số truy vấn cơ sở dữ liệu đã thực hiện.', 'counter', [['', state.dbQueries]]);
  push('kho_db_errors_total', 'Tổng số lỗi cơ sở dữ liệu.', 'counter', [['', state.dbErrors]]);
  push(
    'kho_stock_documents_total',
    'Số phiếu nhập/xuất/điều chỉnh đã tạo.',
    'counter',
    [['', state.stockAdjustments]]
  );
  push('kho_uptime_seconds', 'Thời gian ứng dụng đã chạy (giây).', 'gauge', [['', Math.floor((Date.now() - startedAt) / 1000)]]);
  push('kho_process_start_time_seconds', 'Thời điểm khởi động ứng dụng (Unix timestamp).', 'gauge', [
    ['', Math.floor(startedAt / 1000)]
  ]);

  return `${lines.join('\n')}\n`;
}

module.exports = { trackRequest, trackDbQuery, trackDbError, trackStockAdjustment, render };
