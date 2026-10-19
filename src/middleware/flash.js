'use strict';

/**
 * Thông báo một lần (flash): đọc ở request kế tiếp rồi xoá.
 * Lưu trong cookie đã ký, không cần thêm dependency lưu session phía server.
 */
function flash(req, res, next) {
  const messages = (req.session && req.session.flash) || [];
  if (req.session) req.session.flash = [];
  res.locals.flash = messages;

  req.flash = (type, text) => {
    if (!req.session) return;
    if (!req.session.flash) req.session.flash = [];
    req.session.flash.push({ type, text });
  };

  next();
}

module.exports = flash;
