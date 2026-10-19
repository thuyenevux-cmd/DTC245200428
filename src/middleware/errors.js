'use strict';

function notFound(req, res) {
  res.status(404).render('pages/error', {
    title: 'Không tìm thấy trang',
    status: 404,
    message: `Đường dẫn ${req.originalUrl} không tồn tại.`
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).render('pages/error', {
    title: 'Đã xảy ra lỗi',
    status,
    message: env_message(err)
  });
}

function env_message(err) {
  if (err && err.expose) return err.message;
  if (err && err.code === 'ER_DUP_ENTRY') return 'Dữ liệu đã tồn tại (trùng mã hoặc tên).';
  if (err && err.code === 'ER_NO_REFERENCED_ROW_2') return 'Không tìm thấy dữ liệu tham chiếu.';
  return 'Hệ thống gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại.';
}

module.exports = { notFound, errorHandler };
