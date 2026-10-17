# Module 2: Mô hình hóa & Thuộc tính Civil 3D (Chương 5 — 8)

## Chương 5: Quản lý Vật liệu, Code Set Style và Bề mặt

### Bài 5.1: Phân loại Code trong Subassembly (Point, Link, Shape)
- **Mục tiêu**: Hiểu rõ vai trò của 3 loại mã hình học trong Civil 3D:
  - **Point Codes**: Tạo đường 3D Feature Lines (mép mặt, mép lề, đáy rãnh, chân taluy).
  - **Link Codes**: Tạo các mặt phẳng liên kết (Top, Datum, Pave, Base, Subbase) phục vụ tạo Surface.
  - **Shape Codes**: Tạo khối hình học đặc (Pave1, Pave2, Base, SubBase, Curb, Concrete) phục vụ trích xuất 3D Solids.
- **Thao tác**: Tùy biến bảng Code Set Style, gán Render Material và màu sắc hiển thị trực quan cho từng lớp kết cấu.

### Bài 5.2: Thiết lập Render Material và Thông tin Vật liệu
- **Mục tiêu**: Gán đúng vật liệu hiển thị thực tế (Bê tông nhựa chặt C19, C12.5, Cấp phối đá dăm loại 1, Bê tông xi măng M300).
- **Kiểm tra**: Chuyển chế độ xem sang Realistic hoặc Shaded with Edges trong AutoCAD; kiểm tra độ sắc nét và hướng vân bề mặt.

---

## Chương 6: Trích xuất Corridor Solids phục vụ BIM

### Bài 6.1: Lệnh `Create Corridor Solids` trong Civil 3D 2027
- **Mục tiêu**: Chuyển đổi mô hình Corridor tham số động thành các khối thực thể 3D Solid độc lập để đưa vào Navisworks và InfraWorks.
- **Thao tác**:
  1. Chọn Corridor -> Trên Ribbon ngữ cảnh chọn `Extract Corridor Solids`.
  2. Chọn phạm vi: Toàn tuyến hoặc theo từng Region cụ thể.
  3. Lựa chọn phân tách: Tách theo Subassembly Shape hoặc hợp nhất theo lớp vật liệu.
  4. Phân đoạn lý trình (Station Sampling): Chia nhỏ các khối solid theo khoảng cách cọc (ví dụ mỗi đốt dài 20m hoặc 50m) để phục vụ gán tiến độ thi công 4D sau này.
- **Lưu ý**: Lưu các solids sang một file DWG độc lập (`BIM27-ROA-SLD-TKTC-MOD.dwg`) để giữ nhẹ file corridor gốc và duy trì liên kết Dynamic Link.

### Bài 6.2: Kiểm soát Layer và Quy chuẩn màu sắc Solids
- **Mục tiêu**: Thiết lập cấu trúc Layer tự động theo mẫu: `C-ROAD-PAVE`, `C-ROAD-BASE`, `C-ROAD-SUBB`, `C-ROAD-DAYL`.
- **Sản phẩm**: Bộ tệp hình khối 3D Solid sạch sẽ, không có khối rỗng hay lỗi tự giao cắt hình học.

---

## Chương 7: Quản trị Thuộc tính Mở rộng (Property Sets)

### Bài 7.1: Định nghĩa bộ thuộc tính Property Set Definitions (PSD)
- **Mục tiêu**: Bổ sung thông tin phi hình học (BIM Data) gắn liền vào từng khối 3D Solid bằng lệnh `PROPERTYSETDEFINE`.
- **Danh mục thuộc tính chuẩn hóa**:
  1. `BIM_Project`: Tên dự án, Giai đoạn thiết kế.
  2. `BIM_ElementID`: Mã định danh duy nhất (Unique ID) của cấu kiện (ví dụ: `ROA-P1-KM0+200-L`).
  3. `BIM_Station_Start` & `BIM_Station_End`: Lý trình bắt đầu và kết thúc của đoạn khối.
  4. `BIM_Material`: Tên loại vật liệu và mác thiết kế.
  5. `BIM_Discipline`: Bộ môn phụ trách (Đường bộ, Cầu cống, Thoát nước).
  6. `BIM_Volume`: Thể tích hình học tính toán tự động từ Solid.
  7. `BIM_CostCode`: Mã định mức/đơn giá dự toán.

### Bài 7.2: Tự động hóa gán thuộc tính bằng Formula và Auto-tracking
- **Mục tiêu**: Sử dụng thuộc tính tự động (Automatic Properties) lấy từ thể tích khối `Volume`, chiều dài `Length` và vị trí trọng tâm `Centroid`.
- **Cách kiểm tra**: Mở bảng Properties (Ctrl + 1) -> Tab Extended Data; chọn khối Solid bất kỳ và kiểm tra các trường đã được điền đầy đủ.

---

## Chương 8: Xuất Dữ liệu Trao đổi NWC, DWG và IFC 4.3

### Bài 8.1: Xuất tệp NWC từ Civil 3D qua Navisworks Exporter
- **Mục tiêu**: Tạo tệp bộ nhớ đệm Navisworks NWC trực tiếp từ bản vẽ Civil 3D chứa Solids và Property Sets.
- **Thao tác**:
  1. Lệnh `NWCOUT`.
  2. Thiết lập Navisworks Settings: Đánh dấu chọn `Convert Property Data`, `Convert Object Enablers`, tắt `Convert Hidden Items`.
  3. Kiểm tra kích thước file: Tệp NWC phải nhỏ gọn (thường chỉ bằng 1/5 dung lượng file DWG gốc) và mở nhanh trong Navisworks.

### Bài 8.2: Xuất chuẩn mở IFC 4.3 (Infrastructure Standard)
- **Mục tiêu**: Xuất mô hình sang chuẩn IFC 4.3 dành riêng cho công trình hạ tầng giao thông (IfcRoad, IfcAlignment, IfcCourse).
- **Lưu ý**: Ánh xạ đúng loại thực thể IFC để các phần mềm xem mô hình mở (BIMcollab, Solibri, QGIS) đọc được đúng cấu trúc phân tầng.
