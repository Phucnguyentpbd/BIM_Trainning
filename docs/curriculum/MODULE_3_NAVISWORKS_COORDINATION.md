# Module 3: Phối hợp & Kiểm tra Navisworks (Chương 9 — 13)

## Chương 9: Nhận Cấu kiện Revit và Tổng hợp Mô hình Navisworks

### Bài 9.1: Kiểm tra đầu vào từ Team Revit (Cầu, Hầm, Cống)
- **Mục tiêu**: Thẩm định tính sẵn sàng của các mô hình Revit trước khi ghép nối; kiểm tra đơn vị đo (Millimeters vs Meters), Shared Coordinates và mức độ chi tiết (LOD 300).
- **Thao tác**:
  1. Kiểm tra vị trí đặt trạm mốc của mố cầu và tim đường tại điểm tiếp giáp Km1+200.
  2. Mở file Revit, xuất NWC với tùy chọn `Shared Coordinates`.
  3. Kiểm tra gốc cao độ Z (Cao độ tuyệt đối theo hệ Hải đồ/Hòn Dấu thay vì cao độ tương đối 0.000 của sàn công trình).

### Bài 9.2: Thiết lập tệp phối hợp NWF (Navisworks File Set)
- **Mục tiêu**: Hiểu bản chất của 3 định dạng Navisworks:
  - **NWC (Cache)**: Tệp nén trung gian do bộ xuất sinh ra.
  - **NWF (Working)**: Tệp quản lý liên kết, lưu trữ góc nhìn (Viewpoints), bộ lọc (Search Sets), ma trận xung đột (Clash) và tiến độ (TimeLiner) mà KHÔNG chứa hình học (dung lượng chỉ vài trăm KB).
  - **NWD (Document)**: Tệp đóng gói phát hành độc lập, nhúng toàn bộ hình học và thuộc tính để gửi cho chủ đầu tư.
- **Thao tác**: Tạo `BIM27-COORD-ALL-V01.nwf`, ghép đồng thời NWC đường Civil 3D và NWC cấu kiện Revit.

---

## Chương 10: Tổ chức Kiểm tra bằng Search Sets, Viewpoints và Mặt cắt

### Bài 10.1: Tạo Selection Sets và Search Sets thông minh
- **Mục tiêu**: Tự động nhóm các đối tượng theo thuộc tính Property Sets đã gắn từ Civil 3D và Revit bằng công cụ Find Items.
- **Cấu hình Search Sets**:
  - `Set_Road_Pavement`: Category `PropertySet`, Property `BIM_Discipline` = `Road` AND `BIM_Material` CONTAINS `Asphalt`.
  - `Set_Bridge_Abutment`: Category `Element`, Property `Family` = `Abutment`.
  - `Set_Drainage_Culverts`: Category `Revit Type`, Property `Category` = `Structural Framing` OR `Pipe`.
- **Ưu điểm**: Khi bản vẽ Civil 3D hoặc Revit được cập nhật và xuất lại NWC, Search Sets tự động cập nhật đối tượng mới mà không cần chọn tay lại.

### Bài 10.2: Thiết lập Saved Viewpoints và Mặt cắt động (Sectioning)
- **Mục tiêu**: Lưu lại các góc nhìn kỹ thuật chuẩn tại nút giao, mố cầu tiếp giáp nền đường, vị trí cống chui; sử dụng hộp mặt cắt (Section Box) để soi rõ cấu tạo bên trong.

---

## Chương 11: Ma trận Va chạm (Clash Matrix) và Quản lý Xung đột

### Bài 11.1: Lập ma trận va chạm hạ tầng giao thông
- **Mục tiêu**: Định nghĩa các bài kiểm tra xung đột thực tế trong công trình tuyến:
  1. *Test 1 (Đường ray/Mặt đường vs Cống ngầm)*: Khoảng cách tĩnh không tối thiểu 0.5m (Clearance Test).
  2. *Test 2 (Nền đắp ta-luy vs Cột điện / Cây xanh hiện hữu)*: Kiểm tra giao cắt cứng (Hard Clash, Dung sai = 0.01m).
  3. *Test 3 (Mố cầu vs Bản quá độ & Lớp móng đường)*: Kiểm tra khớp nối tiếp giáp, tránh chồng lấn thể tích bê tông.

### Bài 11.2: Phân loại, gom nhóm (Grouping) và Báo cáo Issue Log
- **Mục tiêu**: Lọc bỏ các xung đột ảo (False Positives) do dung sai ghép nối; gom nhóm 50 điểm va chạm thành 1 nhóm lỗi chung theo cấu kiện.
- **Xuất báo cáo**: Xuất báo cáo HTML/PDF kèm ảnh chụp, tọa độ va chạm và chỉ định người chịu trách nhiệm sửa đổi trong Issue Log.

---

## Chương 12: Bóc tách và Đối soát Khối lượng (Volume Reconciliation)

### Bài 12.1: Bóc tách khối lượng tự động bằng Navisworks Quantification
- **Mục tiêu**: Xây dựng danh mục công việc (Item Catalog) theo mã hiệu dự toán Việt Nam; liên kết tự động các Search Sets với công tác thanh toán (m3 bê tông nhựa, m3 cấp phối đá dăm, m3 bê tông mố).

### Bài 12.2: Lập bảng đối soát khối lượng 3D vs Mặt cắt 2D truyền thống
- **Mục tiêu**: So sánh kết quả khối lượng tính bằng mô hình 3D Solids trong Navisworks với bảng tính khối lượng trắc ngang trung bình (Average End Area) của Civil 3D.
- **Dung sai chấp nhận**: Chênh lệch khối lượng phải nằm trong khoảng sai số cho phép (< 2-3% tùy theo địa hình cong lượn).

---

## Chương 13: Quy trình Quản lý Thay đổi Thiết kế Hoàn chỉnh

### Bài 13.1: Vận hành một vòng lặp thay đổi thiết kế (Change Loop)
- **Kịch bản thực tế**: Cao độ trắc dọc điều chỉnh nâng lên 0.3m tại đoạn qua cống Km0+650 để đảm bảo thoát nước lũ.
- **Thực hiện vòng lặp 5 bước**:
  1. Điều chỉnh Profile trong Civil 3D -> Corridor tự động Rebuild.
  2. Re-extract Corridor Solids sang tệp DWG solids.
  3. Mở Civil 3D gõ `NWCOUT` để ghi đè NWC.
  4. Mở lại Navisworks NWF -> Nhấn nút `Refresh` (F5).
  5. Chạy lại Clash Detective (bấm `Re-run Tests`) và cập nhật lại bảng khối lượng Quantification.
- **Đánh giá**: Quan sát các lỗi cũ tự động chuyển trạng thái sang `Resolved`, các khối lượng tự động cập nhật theo kích thước mới.
