# Module 6: Quản lý 4D/5D, CDE & Nghiệm thu Bàn giao (Chương 22 — 24)

## Chương 22: Mô phỏng Tiến độ Thi công 4D (Navisworks TimeLiner)

### Bài 22.1: Xây dựng Cấu trúc Phân chia Công việc (WBS) Hạ tầng Giao thông
- **Mục tiêu**: Lập danh mục công việc thi công đường theo đúng trình tự biện pháp kỹ thuật:
  1. Giai đoạn 1: Dọn dẹp mặt bằng, đào bóc hữu cơ, đắp đất nền đường K95, K98.
  2. Giai đoạn 2: Thi công cống ngang thoát nước, hố thu và gia cố ta-luy.
  3. Giai đoạn 3: Rải cấp phối đá dăm loại 2, loại 1 (Subbase & Base).
  4. Giai đoạn 4: Tưới nhựa thấm bám, thảm bê tông nhựa rỗng C19 và nhựa chặt C12.5.
  5. Giai đoạn 5: Lắp đặt dải phân cách, hộ lan tôn sóng, biển báo và sơn vạch kẻ đường.
- **Tích hợp**: Nhập tiến độ từ file Microsoft Project (.mpp) hoặc tệp CSV/Excel vào bảng TimeLiner.

### Bài 22.2: Liên kết Tự động Đối tượng Mô hình với Đầu việc Tiến độ
- **Mục tiêu**: Sử dụng TimeLiner Rules để tự động gán các Search Sets đối tượng tương ứng vào từng dòng công việc theo mã lý trình và loại cấu kiện.
- **Mô phỏng 4D**: Chạy thử mô phỏng thời gian thực (Simulation); gán màu hiển thị: Màu xanh lá cây (Đang thi công), Màu thực tế (Đã hoàn thành), Màu đỏ (Chậm tiến độ).
- **Xuất video**: Xuất video mô phỏng tiến độ thi công 4D kèm đồng hồ thời gian và biểu đồ phụ tải.

---

## Chương 23: Tích hợp Chi phí 5D và Kiểm soát Thay đổi Ngân sách

### Bài 23.1: Gán Đơn giá và Định mức Dự toán vào Mô hình BIM
- **Mục tiêu**: Kết nối dữ liệu khối lượng chi tiết từ mô hình 3D (Quantification) với bộ đơn giá xây dựng công trình của địa phương.
- **Thao tác**:
  1. Lập bảng ánh xạ giữa mã công việc `WBS_Code` với mã hiệu định mức xây dựng (ví dụ: `AD.21111` - Đắp đất nền đường, `AF.11111` - Bê tông cống).
  2. Tính toán tổng chi phí dự toán xây dựng tự động từ mô hình: $Chi\ phí = Thể\ tích\ (m^3) \times Đơn\ giá\ (VNĐ/m^3)$.

### Bài 23.2: Kiểm soát Thay đổi Chi phí khi Thiết kế Biến động
- **Mục tiêu**: Khi trắc dọc hoặc taluy thay đổi, khối lượng tự động cập nhật và bảng chi phí 5D tự động nhảy số chênh lệch (Cost Variance Report), giúp chủ đầu tư kiểm soát ngay ngân sách trước khi thi công.

---

## Chương 24: Phát hành Hồ sơ CDE và Bài Tốt nghiệp Tổng hợp

### Bài 24.1: Đóng gói và Lưu trữ CDE theo Tiêu chuẩn ISO 19650
- **Mục tiêu**: Chuyển đổi dữ liệu từ trạng thái `02_SHARED` sang `03_PUBLISHED` và `04_ARCHIVE`.
- **Hồ sơ bàn giao CDE gồm có**:
  1. Thư mục `01_MODELS`: Tệp mô hình gốc Civil 3D DWG, Revit RVT, Navisworks NWF/NWD, InfraWorks SQLite/Local model, GeoPackage QGIS.
  2. Thư mục `02_DOCS`: Báo cáo xung đột (Clash Report), Bảng đối soát khối lượng (BOQ), Báo cáo thuyết minh BIM, Bản đồ PDF.
  3. Thư mục `03_EXCHANGE`: Bộ tệp trung gian mở IFC 4.3, NWC, KMZ Google Earth.
  4. Thư mục `04_MEDIA`: Bộ ảnh phối cảnh chất lượng cao và video diễn họa InfraWorks 60–90 giây, video tiến độ 4D.

### Bài 24.2: Nghiệm thu Bài Tốt nghiệp Tổng hợp (Capstone Project)
- **Mục tiêu**: Học viên hoàn thiện toàn bộ tuyến mẫu 2 km và nộp đủ 4 nhóm sản phẩm nghiệm thu độc lập:
  - **Sản phẩm 1 (Mô hình Phối hợp BIM)**: Tệp Navisworks NWD tổng hợp sạch sẽ, ma trận va chạm đã giải quyết 100% các xung đột cứng, bảng đối soát khối lượng khớp sai số < 3%.
  - **Sản phẩm 2 (Bộ Diễn họa InfraWorks)**: Mô hình bối cảnh địa hình đúng cao độ, 1 video bay dọc tuyến 60-90s chuẩn Full HD, 5 góc ảnh phối cảnh xuất sắc tại nút giao và công trình cầu.
  - **Sản phẩm 3 (Bộ Dữ liệu GIS Hoàn chỉnh)**: Tệp `GeoPackage` chứa đủ các lớp tim tuyến, cọc lý trình, ranh GPMB; tệp bản đồ chia sẻ KMZ mở xem chuẩn xác trên Google Earth và Google My Maps.
  - **Sản phẩm 4 (Hồ sơ Bàn giao CDE & Nhật ký)**: Biên bản kiểm tra mốc tọa độ, nhật ký các vòng lặp thay đổi thiết kế và tài liệu hướng dẫn vận hành khai thác mô hình.
- **Tiêu chuẩn đạt**: Đạt tất cả các tiêu chí trong Bảng đánh giá nghiệm thu cuối khóa được phê duyệt.
