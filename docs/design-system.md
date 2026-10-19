# Design System — Hệ thống Quản lý Kho hàng

> Trạng thái: `draft` (chờ duyệt sau bước kiểm chứng giao diện)
> Cập nhật lần cuối: 2026-10-19
> Nguồn quyết định: đề tài đề 5 (PDF giáo viên) + nghiên cứu `docs/research.md` + lựa chọn của sinh viên (hướng "kho vận hiện đại – xanh petrol/slate")

## 1. Bối cảnh

- **Sản phẩm/thương hiệu:** Hệ thống Quản lý Kho hàng — ứng dụng web nội bộ dùng để quản lý nhập hàng, xuất hàng, tồn kho và nhà cung cấp.
- **Giá trị cung cấp:** một nơi duy nhất để biết *đang có bao nhiêu, đang nợ bao nhiêu, cần nhập gì* — kèm dấu vết từng lần thay đổi số lượng.
- **Đối tượng chính:** nhân viên quản lý kho và nhân viên kho (dùng máy tính tại kho, có thể dùng điện thoại khi cần tra cứu nhanh).
- **Nhu cầu/rào cản:** nhân viên kho làm việc nhanh, nhiều thao tác nhập số; giao diện phải đọc được bảng số dày mà không mỏi mắt, và phải chặn được xuất vượt tồn.
- **Tác vụ chính:** ghi nhập hàng, ghi xuất hàng, cập nhật danh mục hàng và nhà cung cấp.
- **Nền tảng:** web responsive, ưu tiên desktop ≥1280, dùng được trên điện thoại ở mức tra cứu.
- **Đặc điểm cần thể hiện:** cảm giác *kho vận đáng tin cậy* — dữ liệu rõ, số liệu nhất quán, trạng thái hiện ra ngay.
- **Điều cần tránh:** giao diện "template SaaS" (gradient tím, thẻ bo tròn mọp mọp, icon tròn đầy màu), hiệu ứng không phục vụ mục đích, màu sắc loè loẹt, chữ tiếng Việt bị lỗi dấu.

## 2. Tài liệu tham khảo và cách sử dụng

| Nguồn | Thuộc tính học hỏi | Điều sẽ chuyển hóa | Điều không sao chép |
|---|---|---|---|
| Odoo 19 — Inventory dashboards | Chia tầng thông tin kho, cờ tồn âm, giá trị tồn | Dashboard phẳng 3 khối: cảnh báo → số liệu → xu hướng | Bố cục 3 tầng, bảng màu, tên sản phẩm |
| Business Central — WMS reports | Bộ cột bảng tồn kho chuẩn | Cột SKU / nhóm / đơn vị / tồn thực / ngưỡng / trạng thái / giá trị tồn | Bộ cột lô-serial-vị trí (không có dữ liệu), số liệu mẫu |
| StockFlow (WMS) | Phiếu-first, số phiếu theo loại, ledger, sidebar + toast | Phiếu `NH-…` / `XH-…`, bảng sổ kho, shell sidebar thu gọn, toast kết quả | Màu, chữ, văn bản, hình minh hoạ |
| StockSight | Bộ chỉ số dashboard tối giản | 4 KPI + biểu đồ xu hướng 30 ngày + cơ cấu giá trị theo nhóm + top SKU | Code, layout, thư viện biểu đồ |

## 3. Màu sắc

Tất cả tỷ lệ dưới đây **đã đo bằng công thức tương phản WCAG 2.1** (relative luminance) — xem `docs/research.md` §3 và lịch sử lệnh đo.

| Token | HEX | Vai trò | Dùng ở đâu | Contrast đã kiểm tra? |
|---|---|---|---|---|
| `color-bg` | `#F1F4F5` | Nền ứng dụng | Vùng nội dung, trang đăng nhập | — (nền) |
| `color-surface` | `#FFFFFF` | Bề mặt | Thẻ, bảng, hộp thoại | — (nền) |
| `color-surface-alt` | `#E9EFF0` | Bề mặt phụ | Hàng bảng xen kẽ, chip trung tính | — (nền) |
| `color-ink` | `#0E1F22` | Chữ chính | Tiêu đề, nội dung, số liệu | ✅ 15.35:1 trên `bg` · 16.97:1 trên `surface` |
| `color-ink-muted` | `#4C646B` | Chữ phụ | Nhãn, mô tả, đơn vị | ✅ 5.68:1 trên `bg` · 6.28:1 trên `surface` |
| `color-ink-subtle` | `#5C6E73` | Chữ rất nhạt | Placeholder, chú thích | ✅ 4.83:1 trên `bg` · 5.34:1 trên `surface` |
| `color-line` | `#DCE4E6` | Viền trang trí | Đường kẻ bảng, viền thẻ | ⚠️ 1.29:1 — chỉ dùng làm đường kẻ, không mang thông tin |
| `color-line-strong` | `#C4D2D5` | Viền rõ hơn | Viền thẻ, viền khối | ⚠️ 1.55:1 — trang trí |
| `color-control-border` | `#75868C` | Viền điều khiển | Viền input/select (SC 1.4.11) | ✅ 3.79:1 trên `surface` · 3.43:1 trên `bg` |
| `color-primary` | `#0B6B75` | Thương hiệu / hành động chính | Nút chính, link, biểu đồ | ✅ 6.22:1 với chữ trắng · 5.63:1 trên `bg` |
| `color-primary-strong` | `#09565E` | Trạng thái hover/active | Hover nút chính | ✅ 8.39:1 với chữ trắng |
| `color-primary-soft` | `#E1EFF0` | Nền nhấn nhẹ | Nền chip, hàng được chọn | ✅ `primary` 5.28:1 trên nền này |
| `color-accent` | `#C2410C` | Nhấn có chủ đích | Cảnh báo tồn thấp, số đề xuất nhập | ✅ 5.18:1 trên `surface` |
| `color-accent-soft` | `#FCEDE4` | Nền nhấn nhẹ | Nền chip cảnh báo | ✅ 4.53:1 |
| `color-success` | `#146C34` | Thành công | Chip "Còn hàng", toast thành công | ✅ 6.51:1 trên `surface` · 5.60:1 trên `success-soft` |
| `color-success-soft` | `#E5F3E9` | Nền chip thành công | | |
| `color-warning` | `#92400E` | Cảnh báo | Chip "Sắp hết", cảnh báo | ✅ 7.09:1 trên `surface` · 6.10:1 trên `warning-soft` |
| `color-warning-soft` | `#FBF0DF` | Nền chip cảnh báo | | |
| `color-danger` | `#B42318` | Lỗi | Chip "Hết hàng", lỗi form, toast lỗi | ✅ 5.70:1 trên `danger-soft` |
| `color-danger-soft` | `#FCEBEA` | Nền chip lỗi | | |
| `color-info` | `#1D4ED8` | Thông tin | Chip trạng thái phiếu, link phụ | ✅ 5.77:1 trên `info-soft` |
| `color-info-soft` | `#E8EEFC` | Nền chip thông tin | | |
| `color-nav-bg` | `#0E1F22` | Nền thanh điều hướng | Sidebar | nền tối (đo cùng cặp chữ bên dưới) |
| `color-nav-ink` | `#E4EDED` | Chữ trên sidebar | Nhãn điều hướng | ✅ 14.25:1 trên `nav-bg` |
| `color-nav-ink-muted` | `#9FB3B6` | Chữ phụ trên sidebar | Tiêu đề mục, chân sidebar | ✅ 7.75:1 trên `nav-bg` |
| `color-nav-active` | `#0B6B75` | Điểm nhấn trên sidebar | Nền logo, thanh active | ⚠️ 2.73:1 trên `nav-bg` — chỉ dùng làm nền/nét, không dùng cho chữ; chữ đặt trên nền này dùng `#FFFFFF` (6.22:1) |

**Bảng màu biểu đồ** (mỗi màu ≥ 3:1 trên nền trắng để dùng được cho dữ liệu):
`#0B6B75` (6.22:1) · `#37838C` (4.39:1) · `#C2410C` (5.18:1) · `#9C6A16` (4.68:1) · `#47606B` (6.66:1).
Nhập = `#0B6B75`, Xuất = `#C2410C` — hai màu khác rõ cả hue lẫn lightness.

Không dùng màu gradient, không dùng bóng đổ màu, không dùng màu làm nền chữ.

## 4. Typography

### Font tiêu đề
- **Tên chính xác:** Be Vietnam Pro (family của Lâm Bảo, Tony Le, ViệtAnh Nguyễn — bản "Neo Grotesk" thiết kế riêng cho tiếng Việt)
- **Nguồn tải:** `@fontsource/be-vietnam-pro` (tự host, không dùng CDN)
- **Giấy phép/điều kiện sử dụng:** SIL Open Font License 1.1 — cho phép dùng thương mại; giữ nguyên thông báo giấy phép khi phát hành
- **Weight được dùng:** 600 (tiêu đề), 700 (điểm nhấn số lớn)
- **Fallback:** `'Be Vietnam Pro', 'Segoe UI', system-ui, -apple-system, sans-serif`
- **Đã test dấu tiếng Việt:** ✅ Có — kiểm tra trực tiếp trên trình duyệt (Chromium) ở các trang Tổng quan, Tồn kho, Phiếu nhập hàng, Lịch sử giao dịch: dấu `ă â ê ô ơ ư đ` và các từ như *Tồn kho*, *Phiếu nhập*, *Nhà cung cấp*, *Sắp hết* hiển thị đúng, không lỗi dấu, không lệch baseline ở weight 400/500/600/700. File font tự host kèm subset `vietnamese` và `latin` (8 file woff2, ~135 KB) — xem `public/vendor/fonts/`.

### Font nội dung
- **Tên chính xác:** Be Vietnam Pro (dùng chung family cho tiêu đề và nội dung — hệ thống chỉ có một font, giảm tải tải trọng và giữ nhịp chữ đồng nhất)
- **Nguồn tải:** `@fontsource/be-vietnam-pro` — subset `vietnamese` + `latin`, weights 400/500/600/700
- **Giấy phép/điều kiện sử dụng:** SIL OFL 1.1
- **Weight được dùng:** 400 (nội dung), 500 (nhãn, nút), 600 (tiêu đề nhỏ)
- **Fallback:** `'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif`
- **Đã test dấu tiếng Việt:** ✅ Có — xem mục font tiêu đề; số liệu dùng `font-variant-numeric: tabular-nums` để cột số thẳng hàng (đã kiểm tra ở bảng tồn kho và bảng sổ kho)

Số liệu trong bảng và KPI dùng `font-variant-numeric: tabular-nums` để cột số thẳng hàng.

### Test bắt buộc
`Ăn ở, uống trà, giữ gìn tiếng Việt: ă â ê ô ơ ư đ.`

| Kiểu chữ | Desktop | Mobile | Weight | Line-height | Ghi chú |
|---|---:|---:|---:|---:|---|
| H1 | 28px | 24px | 700 | 1.25 | Trang tiêu đề, tiêu đề section lớn |
| H2 | 20px | 18px | 600 | 1.35 | Tiêu đề trang (trang con) |
| H3 | 16px | 16px | 600 | 1.45 | Tiêu đề card, tiêu đề cột bảng nhóm |
| Body | 14px | 14px | 400 | 1.6 | Nội dung, ô nhập |
| Small | 13px | 13px | 400 | 1.5 | Mô tả phụ, chú thích |
| Caption | 12px | 12px | 500 | 1.45 | Nhãn trường, tiêu đề cột bảng |
| Button | 14px | 14px | 500 | 1 | Nút hành động |
| KPI value | 28px | 24px | 700 | 1.15 | Số lớn trên thẻ chỉ số |

## 5. Layout và hình khối

- **Max content width:** 1360px (vùng nội dung sau sidebar), padding 24px (16px ở ≤768px)
- **Grid/columns:** sidebar 248px (thu gọn còn 64px) + vùng nội dung; dashboard dùng lưới 12 cột, KPI 4 cột trên desktop / 2 cột tablet / 1 cột mobile
- **Breakpoints:** 520px · 768px · 1080px · 1360px
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (px) — dùng đúng bảng này, không tự chế số lẻ
- **Border radius:** 4px (chip nhỏ, tag) · 6px (input, nút) · 10px (card, modal) · 999px (chip tròn, avatar)
- **Border width:** 1px (`color-line` cho thẻ, `color-control-border` cho ô nhập)
- **Shadow/elevation:** 2 mức — `0 1px 2px rgba(14,31,34,.06)` (thẻ) và `0 8px 24px rgba(14,31,34,.10)` (dropdown, modal, toast). Không dùng shadow để tạo hiệu ứng thị giác.
- **Quy tắc dùng whitespace:** mọi khối cách nhau ít nhất 1 spacing step; bảng dùng padding dọc 12px để dày nhưng không rộng.

## 6. Icon và minh hoạ

- **Bộ icon duy nhất:** Lucide (ISC License — miễn phí thương mại), tự host dưới `public/icons/`
- **Cách nhập/dùng:** file SVG tĩnh `<img src="/icons/xxx.svg">` hoặc inline `<svg>` cho icon cần đổi màu; không dùng icon font, không dùng emoji
- **Giấy phép/attribution:** ISC — ghi "Icon: Lucide (ISC)" trong README
- **Stroke/fill/size chuẩn:** stroke 1.75px, viewBox 24×24; cỡ 16px (trong ô bảng) · 18px (nút, chip) · 20px (điều hướng) · 24px (trạng thái rỗng)
- **Quy tắc:** không trộn bộ; không tự vẽ icon lệch nét; icon mang ý nghĩa luôn có `alt`/`aria-label`; icon trang trí dùng `aria-hidden="true"`.

## 7. Hình ảnh

- **Chủ thể:** ảnh chụp kho thật, mặt bằng kho, bao bì sản phẩm
- **Phong cách ánh sáng và màu:** tự nhiên, nhiều khoảng trắng, không filter màu mạnh
- **Góc máy/bố cục:** chính diện hoặc chếch 30°, thấy rõ kệ hàng
- **Tỷ lệ ảnh:** 4:3 cho thẻ, 16:9 cho ảnh phủ
- **Quy tắc crop:** `object-fit: cover`, focus vào khoảng giữa
- **Nguồn ảnh và giấy phép:** ⏳ chưa có ảnh nào được cấp — ứng dụng hiện **không dùng ảnh minh hoạ**, chỉ dùng icon và dữ liệu thật. Nếu bổ sung ảnh sau, phải ghi rõ nguồn và giấy phép.
- **Fallback khi thiếu ảnh:** không áp dụng (không có vùng ảnh nào trong giao diện hiện tại).

## 8. Components và trạng thái

| Component | Quy tắc cơ bản | Hover | Focus | Disabled/Error |
|---|---|---|---|---|
| Button primary | nền `primary`, chữ trắng, radius 6, padding 10/16 | nền `primary-strong` | viền 2px `primary` + offset 2px | nền `#9BB9BC`, chữ `#F1F4F5`, `cursor:not-allowed` |
| Button secondary | nền trắng, viền `control-border`, chữ `ink` | nền `surface-alt` | như primary | chữ `ink-subtle`, viền `line` |
| Button danger | nền `danger`, chữ trắng | nền `#8F1B12` | viền 2px `danger` | như primary |
| Button ghost | không viền, chữ `primary` | nền `primary-soft` | như primary | chữ `ink-subtle` |
| Input / Select | cao 38px, viền `control-border`, radius 6, focus viền `primary` 2px + shadow nền | viền `#5F7178` | viền 2px `primary` | nền `surface-alt`, chữ `ink-subtle` |
| Field lỗi | viền `danger`, dưới field hiện lỗi bằng `danger` 12px | — | — | — |
| Card | nền `surface`, viền `line`, radius 10, padding 20 | viền `line-strong` khi nổi | — | — |
| Table | header nền `surface-alt`, chữ `caption` `ink-muted`; hàng xen kẽ `surface-alt` 4%; hàng hover `primary-soft`; số căn phải `tabular-nums` | như trên | focus vào ô | — |
| Chip trạng thái | radius 999, padding 2/8, 12px 500 | — | — | — |
| Navigation item | 36px, radius 6, icon 20px + nhãn 14px; active: nền `primary-soft`, chữ `primary`, thanh trái 2px `primary` | nền `surface-alt` | viền 2px `primary` offset -2px | — |
| Modal | nền `surface`, radius 10, shadow lớn, overlay `rgba(14,31,34,.45)` | — | khoá focus bên trong, `Esc` đóng | — |
| Toast | góc phải dưới, radius 8, shadow lớn, tự ẩn 4s | — | — | — |

Trạng thái bảng bắt buộc: mặc định (chuỗi rỗng có lời nhắc + nút hành động), hover, focus, disabled, lỗi (form + toast), đang tải (skeleton hoặc spinner trong nút).

## 9. Chuyển động

- **Mục tiêu UX:** phản hồi rõ thao tác đã được nhận, không gây chờ
- **Thư viện:** không dùng thư viện animation — chỉ transition CSS
- **Duration/easing:** 120ms (hover, focus) · 180ms (toast, dropdown) · easing `cubic-bezier(.2,.8,.2,1)`
- **Trigger:** hover/focus, mở/đóng menu, toast vào/ra
- **Hành vi `prefers-reduced-motion`:** `@media (prefers-reduced-motion: reduce)` → mọi transition/animation về 0.01ms
- **Chuyển động không được dùng:** hiệu ứng xuất hiện theo lướt (stagger), đếm số, hiệu ứng parallax, gradient chạy, hiệu ứng "AI" (glow, aurora)

## 10. Quyết định đã duyệt

- [ ] Màu
- [ ] Font và dấu tiếng Việt
- [ ] Icon
- [ ] Layout và spacing
- [ ] Hình ảnh
- [ ] Components và states
- [ ] Chuyển động
- [ ] Kiểm tra responsive/accessibility

**Quyết định còn mở:** chưa có quyết định nào được duyệt — tài liệu ở trạng thái `draft`, sẽ chuyển `reviewed` sau khi sinh viên xem giao diện chạy thật và sau khi kiểm chứng §4 (dấu tiếng Việt) + §7 (responsive, accessibility) ở `docs/quality-checklist.md`.
