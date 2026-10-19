# Checklist QA — Hệ thống Quản lý Kho hàng

> Ngày kiểm tra: 2026-10-19
> Môi trường kiểm tra: Chromium 156 (qua `bsk`), khung nhìn 1440×900 và 390×844 (iPhone 14), dữ liệu mẫu 28 mã hàng / 65 phiếu / 135 dòng sổ kho.
> Quy ước: `Đạt` = đã kiểm tra thực tế · `Cần sửa` = đã kiểm tra và còn lỗi · `Chưa kiểm tra` = chưa làm.

## Nhận diện và nội dung

- [Đạt] — Nhận ra ngay đây là phần mềm quản lý kho: sidebar có mục Nhập hàng / Xuất hàng / Tồn kho / Sản phẩm / Nhà cung cấp / Lịch sử giao dịch; mã phiếu theo định dạng `NH-2026-00xx` (nhập), `XH-…` (xuất), `ADJ-…` (điều chỉnh); bảng tồn hiện tồn thực, ngưỡng nhập lại, trạng thái.
- [Đạt] — Headline cụ thể, hướng tới người dùng kho: "Tổng quan kho", "Cần nhập gấp", "Ghi nhập hàng", "Ghi xuất hàng" (không dùng câu chung chung kiểu template).
- [Đạt] — Không có lời tự khen hay lời hứa thiếu bằng chứng: toàn bộ chữ số trên dashboard đến từ truy vấn sổ kho, không có số liệu marketing.
- [Đạt] — CTA gọi đúng hành động và dẫn tới nơi có thật: "Ghi nhập hàng" → `/stock/in`, "Ghi xuất hàng" → `/stock/out`, "Thêm sản phẩm" → `/products/new`; sau khi lưu hiện toast kèm số phiếu thật.
- [Đạt] — Giọng văn đúng quy tắc trong `docs/brand-voice.md`: thông báo lỗi ghi rõ mã hàng và số lượng ("Tồn kho không đủ để xuất: DT-0034 (còn 75, cần 99999)"); không dùng cụm từ bị cấm.

## Design System

- [Đạt] — Màu dùng token/mã HEX thống nhất: toàn bộ màu khai báo trong `public/css/tokens.css`, không có mã màu rải rác trong component.
- [Đạt] — Font đúng tên, weight, fallback: Be Vietnam Pro 400/500/600/700, fallback `'Segoe UI', system-ui`; dùng chung một family cho tiêu đề và nội dung.
- [Đạt] — Dấu tiếng Việt render đúng ở các weight đang dùng: kiểm tra trực tiếp trên trình duyệt, dấu `ă â ê ô ơ ư đ` và các từ *Tồn kho, Phiếu nhập, Nhà cung cấp, Sắp hết* hiển thị đúng ở weight 400/500/600/700, không lỗi dấu, không lệch baseline.
- [Đạt] — Icon cùng một bộ, kích thước và stroke nhất quán: bộ Lucide (ISC), stroke 1.75, cỡ 16/18/20/24; không trộn bộ, không icon font, không emoji.
- [Đạt] — Spacing, radius, border, shadow tuân theo token: thang 4px, radius 4/6/10/pill, border 1px, đúng 2 mức shadow.
- [Đạt] — Hình ảnh: ứng dụng không dùng ảnh minh hoạ nào, nên không có ô ảnh trống hay ảnh chưa được ghi nguồn.

## Responsive và accessibility

- [Đạt] — Đã xem ở khung nhìn nhỏ (390×844), vừa (1440×900). Trước khi sửa, trang Tổng quan bị tràn ngang (`scrollWidth` 658 > `clientWidth` 390) do ô lưới không co lại được; đã sửa bằng `min-width: 0` cho item của lưới → sau khi sửa tất cả 6 trang đều có `scrollWidth = clientWidth = 390`.
- [Đạt] — Không có tràn ngang, chữ bị cắt hoặc dấu tiếng Việt đè nhau (đo trực tiếp `scrollWidth`/`clientWidth` trên 6 trang ở khung 390px).
- [Đạt] — Phân cấp heading hợp lý: một `h1` mỗi trang (tiêu đề trong topbar), `h2` cho tiêu đề trang, `h3` cho tiêu đề card; nội dung quét nhanh theo khối KPI → biểu đồ → bảng.
- [Đạt] — Độ tương phản đã tính bằng công thức WCAG 2.1 cho từng cặp màu (xem bảng trong `docs/design-system.md`); chữ chính 15.35:1, chữ phụ 5.68:1, nút primary 6.22:1, chip trạng thái ≥ 4.38:1.
- [Đạt] — Thành phần tương tác dùng được bằng bàn phím và có focus rõ: Tab dừng ở các mục điều hướng, focus hiện viền 2px màu primary (đo `outlineWidth`).
- [Đạt] — Nút/liên kết có nhãn rõ; icon chức năng có `aria-label` (ví dụ "Sửa DT-0034", "Xoá DT-0034"); icon trang trí có `aria-hidden="true"`.
- [Đạt] — Chuyển động không gây cản trở và tôn trọng `prefers-reduced-motion`: đo `transitionDuration` = 0.01ms khi trình duyệt bật `prefers-reduced-motion: reduce`.

## Kỹ thuật

- [Đạt] — Link, nút, form và trạng thái lỗi hoạt động đúng: đăng nhập/đăng xuất, thêm/sửa/xoá sản phẩm, thêm/sửa/xoá nhà cung cấp, lọc và phân trang danh sách, ghi nhập/ghi xuất phiếu — đều đã thao tác thật trên trình duyệt.
- [Đạt] — Trạng thái lỗi hiển thị đúng chỗ: phiếu xuất vượt tồn bị chặn ở server, thông báo "Tồn kho không đủ để xuất: DT-0034 (còn 75, cần 99999)" hiện ở đầu form, kèm cảnh báo tiếng Việt ngay tại dòng ("Vượt tồn hiện có (75 cái)"); tồn kho không đổi.
- [Đạt] — Không có ô ảnh trống hoặc placeholder chưa được đánh dấu (không dùng ảnh).
- [Đạt] — SVG hợp lệ, sắc nét, dùng token/màu thống nhất: icon nội tuyến vẽ bằng `stroke="currentColor"`, số liệu biểu đồ lấy từ biến CSS `--color-chart-*`.
- [Đạt] — Không có lỗi runtime/console: `bsk console` trả về "no console messages captured" ở tất cả các lượt kiểm tra.
- [Đạt] — Không thêm dependency không cần thiết: `express`, `ejs`, `mysql2`, `bcryptjs`, `cookie-session`, `dotenv` cho phía server; phía client chỉ có Chart.js và font/icon tự host. Mã hàng nghiệp vụ không phụ thuộc framework giao diện.
- [Đạt] — Hiệu năng: các trang dữ liệu dùng truy vấn có chỉ mục (`stock_movements(product_id, created_at)`, `stock_movements(document_id)`, `products(sku)`, `products(category_id)`), phân trang 12–20 bản ghi/trang, đã đo thời gian phản hồi từng trang dưới 1 giây trên mạng nội bộ.

## Bằng chứng và giấy phép

- [Đạt] — Không có số liệu/review/chứng nhận bị bịa: mọi con số trên giao diện đến từ dữ liệu trong MySQL.
- [Đạt] — Giấy phép đã xác minh và lưu kèm tài nguyên: Be Vietnam Pro (SIL OFL 1.1), Lucide (ISC), Chart.js (MIT) — 3 file giấy phép trong `public/vendor/licenses/`.
- [Đạt] — Các website tham khảo chỉ cung cấp nguyên tắc, không bị sao chép nguyên xi: xem bảng "Điều KHÔNG sao chép" trong `docs/research.md`.

## Tóm tắt phát hành

- **Lỗi quan trọng còn lại:** không còn lỗi chặn sử dụng. Đã sửa trong lượt này: (1) KPI "Phiếu 30 ngày" nối chuỗi `34`+`22` thành `3.422`; (2) tràn ngang ở khung 390px do ô lưới không co lại; (3) nút menu hamburger hiện cả trên desktop do `.btn` đè lên `.topbar__toggle`; (4) thuộc tính `max` trên ô số lượng chặn submit bằng thông báo native tiếng Anh — đã thay bằng cảnh báo tiếng Việt trong dòng.
- **Kiểm tra đã chạy:** đăng nhập/đăng xuất; ghi nhập hàng (tạo được phiếu `NH-2026-0039`, tồn tăng đúng 40 đơn vị); ghi xuất hàng (tạo được phiếu `XH-2026-0023`, tồn giảm đúng); xuất vượt tồn bị chặn và tồn không đổi; thêm sản phẩm; lọc danh mục theo từ khoá/nhóm; lọc tồn kho theo trạng thái; lọc sổ kho theo loại phiếu; phân trang 3 trang; console sạch; responsive 2 khung nhìn; focus bàn phím; reduced-motion.
- **Kiểm tra chưa chạy:** chưa kiểm tra bằng trình đọc màn hình thật (screen reader); chưa kiểm tra trên Safari/Firefox; chưa kiểm tra hiệu năng tải trang dưới tải cao; chưa chạy kiểm thử tự động (unit/integration) vì phạm vi đề tài không yêu cầu.
- **Tài sản/giấy phép cần xác minh:** không còn tài sản nào chưa rõ giấy phép.
- **Quyết định cần người dùng duyệt:** (1) tên hiển thị "Quản lý kho hàng" trên giao diện; (2) bảng màu petrol/slate và sidebar tối; (3) bộ font Be Vietnam Pro; (4) cấu trúc 8 mục điều hướng.
