# Nghiên cứu tham khảo — Hệ thống Quản lý Kho hàng

> Ngày khảo sát: 2026-10-19
> Phạm vi: 4 nguồn, mỗi nguồn lấy **nguyên tắc** (cấu trúc thông tin, phân cấp số liệu, luồng nghiệp vụ, cách trình bày) — **không sao chép** bố cục, màu, chữ, văn bản hay nhận diện của bất kỳ nguồn nào.

## 1. Danh sách nguồn

| # | Nguồn | Ngày kiểm tra | Trạng thái | Thuộc tính học họi |
|---|---|---|---|---|
| A | Odoo 19 — *Inventory dashboards* (tài liệu chính thức) | 2026-10-19 | Truy cập được, đọc nội dung trang | Cách chia dashboard kho thành 3 lớp: vận hành hằng ngày → phân tích hiệu quả → giá trị & sẵn có; cách đặt cờ *tồn âm*, *hàng chậm luân chuyển*, *còn tồn đã cam kết* |
| B | Microsoft Dynamics 365 Business Central — *Inventory and warehouse reports* | 2026-10-19 | Truy cập được | Bộ cột "chuẩn" cho bảng tồn kho và báo cáo: SKU, mô tả, đơn vị tính, vị trí, tồn thực, khả dụng, đã phân bổ, đang đến, tồn an toàn, điểm đặt hàng lại, số lượng đề xuất nhập, nhà cung cấp, ngày PO cuối, ngày nhận cuối |
| C | StockFlow — sản phẩm WMS thật (trang công khai) | 2026-10-19 | Truy cập được | Mô hình **tài liệu trước, sổ kho sau**: biên nhận / biên xuất / chuyển kho / điều chỉnh, mỗi loại có số phiếu riêng (`REC-0001`, `DEL-0001`, `ADJ-0001`); vòng đời phiếu Draft → Waiting → Ready → Done; nguyên tắc "mọi thay đổi số lượng đều có dấu vết"; ngưỡng cảnh báo tồn thấp; shell sidebar thu gọn được, bảng sort/filter được, toast báo kết quả |
| D | StockSight — mã nguồn mở (Flask + MySQL) | 2026-10-19 | Truy cập được | Cấu trúc API dashboard và bộ chỉ số tối giản: tổng SKU, số SKU dưới ngưỡng, giá trị tồn, biểu đồ cơ cấu giá trị theo nhóm, xu hướng biến động theo loại giao dịch, top sản phẩm theo giá trị tồn, nhật ký biến động |

## 2. Nguyên tắc rút ra và cách chuyển hóa

### 2.1 Tách bạch ba khái niệm tồn kho (nguồn A, B, D)
> Nguyên tắc: không gộp "đang có" với "đã bị chiếm" và "còn dùng được".

Hệ thống này giữ **tồn thực** (`stocks.quantity`) và tính sẵn có = tồn thực − đã cam kết. Vì đề tài không yêu cầu đơn hàng bán ra, hệ thống chỉ mô phỏng lượng **đã cam kết** ở mức tối giản: mỗi phiếu xuất đã tạo được coi là đã trừ tồn ngay, nên "khả dụng" = tồn thực. Trường `committed` được dự phòng trong bảng `stocks` để mở rộng mà không phải đổi cấu trúc.

- **Không sao chép**: bảng điều khiển nhiều tầng với cột "Tổng quan vận hành" của Odoo; hệ thống này dùng một dashboard phẳng, ưu tiên tốc độ quét của người quản lý kho.

### 2.2 Phiếu là nguồn sự thật, sổ kho là hệ quả (nguồn C, D)
> Nguyên tắc: mọi thay đổi số lượng đều phải có lý do và dấu vết.

- Mỗi thao tác nhập/xuất tạo **một phiếu có số** (`NH-2026-0001`, `XH-2026-0001`) và **nhiều dòng chi tiết**.
- Mỗi dòng ghi một bản ghi `stock_movements` (loại, số lượng, đơn giá, nhà cung cấp, người thao tác, thời điểm).
- Cập nhật `stocks` và ghi `stock_movements` nằm trong **cùng một transaction** — không bao giờ có trường hợp tồn khớp nhưng thiếu dòng lịch sử.

### 2.3 Ngưỡng nhập lại thay vì "còn hàng / hết hàng" (nguồn A, B, C)
> Nguyên tắc: cảnh báo phải gắn với con số hành động, không phải cảm tính.

- Mỗi SKU có `reorder_point` (ngưỡng nhập lại). Bảng **"Cần nhập gấp"** hiển thị: tồn thực, ngưỡng, **số lượng đề xuất nhập** = `reorder_point × 2 − tồn thực` (làm tròn lên, tối thiểu 1).
- Hệ thống **không** chặn người dùng khi tồn thấp; nó chỉ nêu rõ số liệu để quyết định.

### 2.4 Cấu trúc bảng dữ liệu (nguồn B)
Bảng tồn kho dùng các cột cốt lõi, bỏ các cột không có dữ liệu thật trong phạm vi đề tài:

| Cột | Nguồn | Ghi chú |
|---|---|---|
| Mã SKU | B | khoá tra cứu, có thể copy |
| Tên hàng | B | |
| Nhóm hàng | D | dùng cho cơ cấu giá trị |
| Đơn vị tính | B | |
| Tồn thực | B | số nguyên, không âm |
| Ngưỡng nhập lại | B | |
| Trạng thái | A, C | `Còn hàng` / `Sắp hết` / `Hết hàng` — tính tự động từ tồn và ngưỡng |
| Giá trị tồn | A | = tồn thực × giá vốn |
| Nhà cung cấp | B | từ phiếu nhập gần nhất |

Cột `bin/location`, `lot/serial`, `on order`, `days since last movement` **không** đưa vào vì hệ thống chỉ có một kho, không quản lý lô/serial — đưa vào sẽ là cột chết.

### 2.5 Dashboard: 3 khối thông tin theo thứ tự ưu tiên (nguồn A, C, D)
1. **Cảnh báo trước** — hàng dưới ngưỡng và hết hàng nằm ngay hàng đầu, vì đó là việc cần làm hôm nay.
2. **Số liệu tổng quan** — tổng SKU, giá trị tồn, lượt nhập/xuất 30 ngày.
3. **Xu hướng và cơ cấu** — biểu đồ nhập/xuất 30 ngày, cơ cấu giá trị tồn theo nhóm hàng, top SKU theo giá trị.

### 2.6 Hình thức giao diện (nguồn C)
- Shell: sidebar trái thu gọn được + thanh trên cố định + vùng nội dung giới hạn chiều rộng.
- Bảng: sắp xếp được, lọc được, có ô tìm kiếm, phân trang.
- Thao tác xong hiện **toast** kết quả (thành công/lỗi) thay vì chuyển trang không báo.
- Với bảng dữ liệu dày, số liệu phải dễ quét: số căn phải, chữ số dùng `tabular-nums`, trạng thái dùng chip màu chứ không dùng màu chữ thuần.

## 3. Điều KHÔNG sao chép

- Bảng màu, typography, icon set, cách bo góc và bố cục của Odoo / Business Central / StockFlow / StockSight.
- Bất kỳ câu chữ, ảnh minh hoạ hay số liệu marketing nào từ các nguồn trên.
- Toàn bộ tên sản phẩm, logo và thương hiệu của các nguồn.
