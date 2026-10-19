'use strict';

/**
 * Copy tài nguyên tĩnh (font, icon, Chart.js) từ node_modules vào public/vendor
 * để ứng dụng tự host — không gọi CDN, không phụ thuộc mạng khi chạy.
 *
 * Chạy tự động sau `npm install` (postinstall) và trong bước build Docker.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vendor = path.join(root, 'public', 'vendor');

const FONT_WEIGHTS = ['400', '500', '600', '700'];
const FONT_SUBSETS = ['vietnamese', 'latin'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  if (!fs.existsSync(from)) {
    console.warn('  ! thiếu:', path.relative(root, from));
    return false;
  }
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  return true;
}

function copyFonts() {
  const src = path.join(root, 'node_modules', '@fontsource', 'be-vietnam-pro', 'files');
  const dest = path.join(vendor, 'fonts');
  let count = 0;
  for (const subset of FONT_SUBSETS) {
    for (const weight of FONT_WEIGHTS) {
      const name = `be-vietnam-pro-${subset}-${weight}-normal.woff2`;
      if (copyFile(path.join(src, name), path.join(dest, name))) count += 1;
    }
  }
  const license = path.join(root, 'node_modules', '@fontsource', 'be-vietnam-pro', 'LICENSE');
  copyFile(license, path.join(vendor, 'licenses', 'BeVietnamPro-OFL.txt'));
  return count;
}

function copyChartJs() {
  const from = path.join(root, 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
  return copyFile(from, path.join(vendor, 'js', 'chart.umd.js')) ? 1 : 0;
}

function copyLicenses() {
  const items = [
    ['node_modules/chart.js/LICENSE.md', 'Chart.js-MIT.txt'],
    ['node_modules/lucide-static/LICENSE', 'Lucide-ISC.txt']
  ];
  let count = 0;
  for (const [from, to] of items) {
    if (copyFile(path.join(root, from), path.join(vendor, 'licenses', to))) count += 1;
  }
  return count;
}

ensureDir(vendor);
const fonts = copyFonts();
const charts = copyChartJs();
const licenses = copyLicenses();
console.log(`[vendor] ${fonts} file font, ${charts} file chart.js, ${licenses} giấy phép → public/vendor`);
