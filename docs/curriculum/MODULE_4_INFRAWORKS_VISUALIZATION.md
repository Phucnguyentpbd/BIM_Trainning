# Module 4: Diễn họa & Trình bày InfraWorks (Chương 14 — 17)

## Chương 14: InfraWorks — Chuẩn bị Bối cảnh và Dữ liệu Nền Địa hình

### Bài 14.1: Khởi tạo mô hình InfraWorks bằng dữ liệu cục bộ (Local Model)
- **Mục tiêu**: Xây dựng mô hình InfraWorks đúng tọa độ mà không phụ thuộc vào dịch vụ đám mây Model Builder.
- **Dữ liệu đầu vào**: tệp mô hình độ cao số DEM từ kho Google Drive dự án đã được cấp quyền.
- **Thao tác**:
  1. Khởi động Autodesk InfraWorks 2027 -> Chọn `New`.
  2. Thiết lập hệ tọa độ (UCS): Chọn hệ tọa độ VN-2000 tương ứng với khu vực dự án (ví dụ: `VN2000 / 3-degree zone 108.0E`).
  3. Nhập dữ liệu địa hình: Data Sources -> Add Raster Terrain -> Chọn tệp DEM từ Google Drive.
  4. Cấu hình độ phân giải và ranh giới hiển thị bối cảnh.
- **Kết quả**: Địa hình 3D thực tế của khu vực tuyến uốn lượn theo đồi núi chính xác từng mét cao độ.

### Bài 14.2: Chèn ảnh trực giao (Orthophoto) và Dữ liệu Thủy hệ
- **Thao tác**: Thêm lớp ảnh hàng không/vệ tinh độ nét cao và lớp vector sông suối từ Shapefile/GeoPackage; thiết lập thứ tự hiển thị Surface Layers.

---

## Chương 15: Đưa Tuyến và Cấu kiện vào InfraWorks

### Bài 15.1: Nhập Corridor Civil 3D qua luồng trực tiếp DWG và IMX
- **Mục tiêu**: Đưa tuyến đường từ Civil 3D vào InfraWorks với đầy đủ mặt cắt, rãnh và taluy.
- **Thao tác**:
  1. Trong Data Sources, chọn `Civil 3D DWG` (hoặc tệp trao đổi IMX được xuất từ Civil 3D bằng lệnh `EXPORTIMX`).
  2. Cấu hình bảng Component Mapping: Ánh xạ từng thành phần của Corridor (Pavement, Shoulder, Daylight Cut, Daylight Fill) sang các kiểu hiển thị (Component Road Styles) tương ứng trong InfraWorks.
  3. Kiểm tra liên kết: Bật chế độ Reimport để khi Civil 3D thay đổi, chỉ cần chuột phải vào Data Source chọn `Reimport` là mô hình InfraWorks tự động cập nhật.

### Bài 15.2: Nhận cấu kiện Revit và Xử lý Lỗi Bề mặt Trùng / Chìm đường
- **Xử lý các lỗi phổ biến**:
  - *Lỗi mặt đường bị địa hình chìm*: Vào Surface Layers, kiểm tra bề mặt Corridor Surface được đặt ở mức ưu tiên làm mịn địa hình xung quanh.
  - *Lỗi cấu kiện cầu cống bị bay hoặc lệch trục*: Cấu hình Manual Positioning và Shared Coordinates khi import tệp RVT/FBX.

---

## Chương 16: Hoàn thiện Diễn họa, Chiếu sáng và Phương án Thiết kế

### Bài 16.1: Phân định Cấu kiện Kỹ thuật và Cảnh quan Bổ trợ
- **Nguyên tắc**: Tuyệt đối không thay đổi hình học tuyến kỹ thuật. Chỉ bổ sung cảnh quan hỗ trợ như: cây xanh hành lang an toàn, hệ thống cột đèn chiếu sáng, cọc tiêu, hộ lan tôn sóng (W-Beam Guardrail) và biển báo giao thông.

### Bài 16.2: Thiết lập Chiếu sáng, Thời gian và Bookmarks
- **Thao tác**:
  1. Điều chỉnh góc chiếu mặt trời (Sun & Sky): Chọn thời điểm buổi sáng (8h00) hoặc hoàng hôn (17h00) để bóng đổ làm nổi bật khối trần của nền đắp và mố cầu.
  2. Tạo bộ đánh dấu Bookmark: Lưu lại các góc nhìn đắt giá (Nút giao đầu tuyến, Cầu vượt sông, Đoạn cua chữ S đèo dốc).

---

## Chương 17: Storyboard, Xuất Video và Quy trình Cập nhật

### Bài 17.1: Xây dựng Storyboard và Quỹ đạo Camera Dọc tuyến
- **Mục tiêu**: Tạo kịch bản trình chiếu động (Animation) chuyên nghiệp dài 60–90 giây.
- **Kỹ thuật điều khiển Camera**:
  1. *Track Animation*: Gán camera chạy tự động bám theo tim tuyến thiết kế ở độ cao mắt tài xế (Cao độ 1.2m so với mặt đường) với vận tốc mô phỏng 60 km/h.
  2. *Orbit Animation*: Camera bay vòng tròn 360 độ quanh nút giao hoặc mố cầu để thể hiện giải pháp kết cấu.
  3. *Chuyển cảnh (Transitions)*: Thêm hiệu ứng Fade In/Fade Out và chèn tiêu đề chữ giới thiệu lý trình, tên hạng mục công trình.

### Bài 17.2: Xuất Video Chất lượng cao và Quy trình Re-render khi có thay đổi
- **Tiêu chuẩn xuất file**: Định dạng MP4, độ phân giải Full HD (1920x1080) ở 30 hoặc 60 khung hình/giây (fps).
- **Quy trình khi Corridor thay đổi**: Reimport Corridor DWG -> Kiểm tra lại vật liệu và địa hình tiếp giáp -> Render lại video mà không cần dựng lại camera từ đầu.
