# Brand Voice và luật viết UI — Hệ thống Quản lý Kho hàng

> Trạng thái: `draft`
> Cập nhật lần cuối: 2026-10-19
> Đây là hệ thống **nội bộ**, người đọc là nhân viên kho — vì vậy giọng văn là giọng của người cùng làm việc: thẳng, cụ thể, không bán hàng.

## 1. Người đọc và lời hứa

- **Đối tượng chính:** nhân viên quản lý kho (10–50 người, dùng máy tính tại kho) và nhân viên kho ghi nhập/xuất (dùng điện thoại hoặc máy tính, thao tác nhiều, đọc ít).
- **Họ đang muốn hoàn thành điều gì:** biết chính xác đang còn bao nhiêu hàng, đã xuất được gì, cần nhập gì, và cập nhật nhanh mà không sợ sai số.
- **Rào cản/nỗi lo thực tế:** sợ nhập sai số lượng; sợ xuất khi hết hàng; không biết ai đã nhập/xuất mấy hàng lúc nào; bảng số dày gây rối.
- **Giá trị thương hiệu có thể chứng minh:** mọi thay đổi số lượng đều có phiếu và dấu vết; tồn kho luôn khớp với sổ kho; ngưỡng nhập lại cho biết trước khi hết hàng.
- **Bằng chứng có sẵn:** dữ liệu thật trong hệ thống (phiếu nhập, phiếu xuất, sổ kho, nhà cung cấp).
- **Thông tin không được tự suy diễn:** không có số liệu marketing, không có đánh giá khách hàng, không có chứng nhận. Dashboard chỉ hiển thị số liệu do hệ thống tự tính.

## 2. Luật giọng văn

| Thuộc tính | Quy tắc | Ví dụ nên làm | Ví dụ tránh |
|---|---|---|---|
| Xưng hô | Không xưng hô trong tiêu đề, nhãn, thông báo. Dùng "bạn" khi cần hướng dẫn ở trang nhập. | "Ghi nhập hàng", "Chưa có dữ liệu tồn kho" | "Chào mừng bạn đến với hệ thống quản lý kho hàng hiện đại nhất!" |
| Độ dài câu | Một câu một ý, ≤ 18 từ. Nhãn giao diện 1–4 từ. | "Xuất vượt tồn của 3 mã hàng" | "Phiếu xuất này không thể được tạo vì số lượng tồn kho hiện tại của một số mã hàng không đủ để đáp ứng yêu cầu" |
| Nhịp câu/dấu câu | Câu ngắn, không dấu chấm cuối tiêu đề/nhãn. Dấu chấm đầy đủ ở thông báo lỗi. | "Tồn kho không đủ để xuất" | "Tồn kho hiện tại của sản phẩm đã chọn không đủ để thực hiện giao dịch xuất hàng này!" |
| Mức độ trang trọng | Trang trọng, không hài hước, không vui vẻ. Ngắn gọn kiểu biểu đồ. | "Cần nhập gấp" | "Kho hàng của bạn đang cạn kiệt rồi đó!" |
| Thuật ngữ chuyên môn | Dùng đúng từ ngành, có giải thích ngắn lần đầu nếu cần. | "Ngưỡng nhập lại", "tồn thực", "phiếu nhập" | "Stock threshold", "on-hand quantity", "goods receipt" |
| Ngôn ngữ/địa phương | Tiếng Việt, không dịch cứng từ tiếng Anh; giữ nguyên mã SKU và tên nhà cung cấp. | "Mã hàng", "Nhà cung cấp" | "SKU", "Vendor", "Warehouse" (chỉ dùng khi nói về kỹ thuật) |
| Bằng chứng và lời hứa | Chỉ nói những gì hệ thống làm được. Không "tối ưu", "thông minh", "tức thì". | "Cập nhật tồn kho ngay khi ghi nhập" | "Tối ưu hoá tồn kho theo thời gian thực" |

## 3. Luật headline

1. Nêu đúng việc cần làm, không mô tả chung chung.
2. Ưu tiên dữ kiện có thật (số lượng, tồn kho) hơn tính từ tự khen.
3. Tránh câu có thể đặt vào bất kỳ hệ thống nào khác.
4. Không dùng số liệu, kết quả hay cam kết nếu chưa có nguồn xác thực.

Tiêu đề trang dùng dạng danh từ + đối tượng: "Sản phẩm", "Tồn kho", "Nhập hàng", "Xuất hàng", "Nhà cung cấp", "Lịch sử giao dịch". Tiêu đề KPI dùng số: "12 mã hàng dưới ngưỡng".

### Bài thử xóa tên thương hiệu
- Headline hiện tại: "Hệ thống Quản lý Kho hàng"
- Khi xóa tên thương hiệu, câu còn đúng với mọi đối thủ không?: **Không** — "Quản lý kho hàng" là mô tả chức năng, và đây là hệ thống nội bộ theo đề tài, nên không cần tên thương hiệu riêng.
- Cần làm cụ thể hơn bằng thông tin gì?: **Không cần.** Ứng dụng nội bộ theo đề tài nên dùng tên mô tả trực tiếp; thương hiệu nằm ở chất lượng dữ liệu và tốc độ thao tác, không ở câu chữ.

## 4. Luật CTA

- **Hành động chính:** ghi nhập / ghi xuất hàng
- **CTA chính:** "Ghi nhập hàng" (tạo phiếu nhập), "Ghi xuất hàng" (tạo phiếu xuất)
- **CTA phụ:** "Thêm sản phẩm", "Thêm nhà cung cấp", "Lưu thay đổi", "Xoá"
- **Điều xảy ra sau khi bấm:** mở form tạo phiếu/danh mục; khi lưu → toast "Đã ghi nhập phiếu NH-2026-0001" và quay lại danh sách; khi lỗi → giữ nguyên form, hiện lỗi ở ô nhập tương ứng.

Mọi CTA phải là động từ + đối tượng. Không dùng "Tìm hiểu thêm", "Bắt đầu", "OK", "Submit" (tiếng Anh).

## 5. Cụm từ cần tránh

| Cụm từ | Lý do | Cách thay thế |
|---|---|---|
| "Hệ sinh thái thông minh" | Vô nghĩa với người dùng kho | Bỏ hẳn; nói rõ chức năng |
| "Một cú click" | Không đúng với quy trình nhiều dòng | "Nhập số lượng rồi lưu phiếu" |
| "Tối ưu hoá tồn kho" | Hệ thống không tự tính đề xuất tối ưu | "Gợi ý số lượng nhập dựa trên ngưỡng nhập lại" |
| "Theo thời gian thực" | Chỉ đúng khi có dữ liệu đẩy tới | "Cập nhật khi ghi nhập phiếu" |
| "Quản lý kho hàng hiện đại nhất" | Tự khen, không kiểm chứng được | Bỏ |
| "Hỗ trợ đa nền tảng" | Không có giá trị với người dùng trong kho | Bỏ |
| "Đơn giản, dễ sử dụng" | Tự khen | Bỏ |
| "Chào mừng bạn đến với…" | Mở bài công thức | Bắt đầu bằng trạng thái thật: "Sản phẩm · 24 mã hàng" |
| "Hy vọng nội dung này hữu ích" | Kết luận sáo rỗng | Kết bằng bước tiếp theo cụ thể |

## 6. Bảng quy đổi thuật ngữ

| Thuật ngữ nguồn | Cách viết ưu tiên | Không dùng | Ghi chú |
|---|---|---|---|
| on hand | tồn thực | "tồn kho hiện có" (mơ hồ) | Dùng khi đối chiếu số |
| available | khả dụng | — | Hiện chưa mở rộng (xem research.md §2.1) |
| reorder point | ngưỡng nhập lại | "mức tối thiểu" | Ngưỡng để quyết định nhập, không phải ngưỡng cảnh báo |
| stock movement | biến động tồn kho / dòng sổ kho | "giao dịch" (mơ hồ) | Lịch sử thay đổi số lượng |
| receipt / goods receipt | phiếu nhập | "phiếu nhập kho" (thừa) | |
| delivery / issue | phiếu xuất | "phiếu xuất kho" (thừa) | |
| adjustment | điều chỉnh tồn kho | "sửa số liệu" | Có lý do ghi kèm |
| SKU | mã hàng | "mã SKU" (thừa) | Viết "mã hàng (SKU)" ở lần đầu |
| vendor / supplier | nhà cung cấp | "vendor" | |
| dashboard | tổng quan | "bảng điều khiển" (dịch cứng) | |
| low stock | sắp hết | "cảnh báo tồn kho thấp" (dài dòng) | Dùng chip trạng thái |

## 7. Mẫu văn bản do chủ thương hiệu viết

Chưa có mẫu văn bản nào do sinh viên viết cho hệ thống này (đề tài mới, không có tài liệu cũ). Vì vậy **không** coi bất kỳ câu nào trong mã nguồn hiện tại là giọng gốc của sinh viên — các câu trong §2–§4 là quy tắc do người thiết kế hệ thống đặt ra, cần sinh viên xác nhận hoặc sửa.

## 8. Quy tắc cập nhật

Khi sinh viên sửa nội dung:

1. Xác định đó là sở thích nhất thời hay nguyên tắc lặp lại.
2. Nếu có bằng chứng là quy tắc bền vững, thêm vào mục phù hợp.
3. Không xoá quy tắc đã duyệt nếu chưa có yêu cầu hoặc lý do rõ ràng.
4. Tóm tắt điều đã học để sinh viên xác nhận khi thay đổi ảnh hưởng đáng kể đến tiếng nói giao diện.
