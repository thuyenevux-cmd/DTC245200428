'use strict';

/**
 * Sinh bản HTML có thể in (A4) từ docs/bao-cao.md để xuất PDF bằng trình duyệt.
 *
 *   npm install
 *   node scripts/build-report.js
 *   # xuất PDF (Chrome):
 *   chrome --headless=new --no-pdf-header-footer \
 *          --print-to-pdf=docs/bao-cao.pdf file://$PWD/docs/bao-cao.html
 *
 * marked nằm trong devDependencies nên không được cài vào image production.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mdPath = path.join(root, 'docs', 'bao-cao.md');
const outPath = path.join(root, 'docs', 'bao-cao.html');

async function main() {
  const { marked } = await import('marked');
  const md = fs.readFileSync(mdPath, 'utf8');
  const body = marked.parse(md, { gfm: true, async: false });

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>Báo cáo đề tài — Hệ thống Quản lý Kho hàng</title>
<style>
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 400; src: url('../public/vendor/fonts/be-vietnam-pro-vietnamese-400-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 500; src: url('../public/vendor/fonts/be-vietnam-pro-vietnamese-500-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 600; src: url('../public/vendor/fonts/be-vietnam-pro-vietnamese-600-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 700; src: url('../public/vendor/fonts/be-vietnam-pro-vietnamese-700-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 400; src: url('../public/vendor/fonts/be-vietnam-pro-latin-400-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 600; src: url('../public/vendor/fonts/be-vietnam-pro-latin-600-normal.woff2') format('woff2'); }
  @font-face { font-family: 'Be Vietnam Pro'; font-weight: 700; src: url('../public/vendor/fonts/be-vietnam-pro-latin-700-normal.woff2') format('woff2'); }

  @page { size: A4; margin: 18mm 16mm 16mm 16mm; }

  :root {
    --ink: #0e1f22;
    --ink-muted: #4c646b;
    --ink-subtle: #5c6e73;
    --line: #dce4e6;
    --primary: #0b6b75;
    --primary-soft: #e1eff0;
    --bg-soft: #f1f4f5;
    --accent: #c2410c;
  }

  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    font-family: 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: var(--ink);
  }

  /* ---------------- Bìa ---------------- */
  .cover {
    height: 253mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    border-top: 8px solid var(--primary);
    padding-top: 14mm;
  }
  .cover__school { text-align: center; }
  .cover__school h2 { margin: 0 0 4mm; font-size: 13pt; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
  .cover__school p { margin: 0; color: var(--ink-muted); font-size: 11pt; }
  .cover__title { text-align: center; }
  .cover__title h1 { font-size: 26pt; line-height: 1.25; margin: 0 0 6mm; color: var(--primary); font-weight: 700; }
  .cover__title p { font-size: 13pt; color: var(--ink-muted); margin: 0; }
  .cover__info { width: 100%; border-collapse: collapse; margin: 0 auto; max-width: 150mm; }
  .cover__info td { padding: 3.2mm 2mm; border-bottom: 1px solid var(--line); font-size: 11.5pt; }
  .cover__info td:first-child { width: 42%; color: var(--ink-muted); font-weight: 500; }
  .cover__foot { text-align: center; color: var(--ink-muted); font-size: 10.5pt; border-top: 1px solid var(--line); padding-top: 5mm; }

  /* ---------------- Nội dung ---------------- */
  h1 { font-size: 18pt; font-weight: 700; margin: 10mm 0 4mm; color: var(--ink); page-break-before: always; }
  h1:first-of-type { page-break-before: auto; }
  h2 { font-size: 14pt; font-weight: 600; margin: 8mm 0 3mm; color: var(--primary); page-break-after: avoid; }
  h3 { font-size: 12pt; font-weight: 600; margin: 6mm 0 2mm; page-break-after: avoid; }
  h4 { font-size: 11pt; font-weight: 600; margin: 4mm 0 2mm; page-break-after: avoid; }
  p { margin: 0 0 3mm; text-align: justify; }
  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }
  a { color: var(--primary); text-decoration: none; }
  strong { font-weight: 600; }
  hr { border: none; border-top: 1px solid var(--line); margin: 6mm 0; }
  code {
    font-family: 'Cascadia Code', Consolas, monospace; font-size: 9.5pt;
    background: var(--bg-soft); padding: 0.6mm 1.4mm; border-radius: 3px;
  }
  pre {
    background: #0e1f22; color: #e4eded; padding: 3mm 4mm; border-radius: 6px;
    overflow: hidden; page-break-inside: avoid; font-size: 9pt; line-height: 1.5;
    font-family: 'Cascadia Code', Consolas, monospace; white-space: pre-wrap; word-break: break-word;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
  blockquote {
    margin: 3mm 0; padding: 2mm 4mm; border-left: 3px solid var(--primary);
    background: var(--primary-soft); color: var(--ink); page-break-inside: avoid;
  }
  table {
    width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; font-size: 9.8pt;
    page-break-inside: avoid;
  }
  th {
    text-align: left; background: var(--bg-soft); color: var(--ink-muted);
    font-weight: 600; font-size: 9pt; text-transform: uppercase; letter-spacing: .02em;
    padding: 2mm 2.5mm; border: 1px solid var(--line);
  }
  td { padding: 1.8mm 2.5mm; border: 1px solid var(--line); vertical-align: top; }
  tbody tr:nth-child(even) td { background: #fafcfc; }
  img { max-width: 100%; page-break-inside: avoid; }
</style>
</head>
<body>
<div class="cover">
  <div class="cover__school">
    <h2>Trường Đại học Công nghệ TP. Hồ Chí Minh</h2>
    <p>Khoa Công nghệ Thông tin — Lớp K23C</p>
    <p style="margin-top:2mm">BÁO CÁO ĐỀ TÀI THỰC HÀNH</p>
  </div>
  <div class="cover__title">
    <h1>HỆ THỐNG QUẢN LÝ KHO HÀNG<br /><span style="font-size:15pt;color:var(--ink-muted)">(INVENTORY)</span></h1>
    <p>Triển khai và Quản trị Hệ thống Phần mềm — Đề 5</p>
  </div>
  <table class="cover__info">
    <tr><td>Họ và tên sinh viên</td><td><strong>Vũ Ngọc Anh Thuyên</strong></td></tr>
    <tr><td>Mã sinh viên</td><td><strong>DTC245200428</strong></td></tr>
    <tr><td>Lớp</td><td>K23C — Công nghệ Thông tin</td></tr>
    <tr><td>Ngày sinh</td><td>14/08/2006</td></tr>
    <tr><td>Nhóm</td><td>5</td></tr>
    <tr><td>Môn học</td><td>Triển khai và Quản trị Hệ thống Phần mềm</td></tr>
    <tr><td>Người hướng dẫn</td><td><strong>Thầy Vũ Việt Dũng</strong></td></tr>
    <tr><td>Năm học</td><td>2025 – 2026</td></tr>
  </table>
  <div class="cover__foot">
    TP. Hồ Chí Minh — 2026<br />
    <span style="font-size:9.5pt">Kho lưu trữ mã nguồn: github.com/thuyenevux-cmd/DTC245200428</span>
  </div>
</div>
${body}
</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log(`Đã sinh ${path.relative(root, outPath)} (${Math.round(html.length / 1024)} KB)`);
}

main().catch((err) => {
  console.error('Lỗi sinh báo cáo:', err.message);
  process.exit(1);
});
