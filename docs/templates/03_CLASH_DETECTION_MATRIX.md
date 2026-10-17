# Biểu mẫu 03: Ma trận Xung đột (Clash Matrix) & Nhật ký Xử lý (Issue Log)

## 1. Ma trận Xung đột Hạ tầng Giao thông (Clash Detection Matrix)

Quy định các cặp kiểm tra giữa các bộ môn, loại xung đột và dung sai cho phép:

| Mã Kiểm Tra | Đối Tượng Bộ Môn A (Selection Set A) | Đối Tượng Bộ Môn B (Selection Set B) | Loại Xung Đột | Dung Sai (Tolerance) | Mức Độ Ưu Tiên | Hành Động Yêu Cầu |
|---|---|---|---|---|---|---|
| **CL-01** | Kết cấu áo đường (`Road_Pavement`) | Cống ngang thoát nước (`Drainage_Culverts`) | Clearance (Khoảng cách tĩnh không) | **0.50 m** | Cao (High) | Thân cống ngập vào lớp móng đường -> Phải hạ trắc dọc cống hoặc nâng trắc dọc đường. |
| **CL-02** | Nền đắp ta-luy (`Road_Daylight`) | Cột điện hiện trạng / Công trình ngầm | Hard Clash (Giao cắt cứng) | **0.01 m** | Khẩn cấp (Critical) | Chân taluy vùi lấp cột điện -> Cần phương án di dời hạ tầng kỹ thuật hoặc xây tường chắn đất. |
| **CL-03** | Mố cầu bê tông (`Bridge_Abutment`) | Lớp móng đường / Bản quá độ (`Road_Base`) | Hard Clash (Giao cắt cứng) | **0.005 m** | Trung bình (Medium) | Thể tích bê tông bị tính trùng -> Điều chỉnh ranh giới phân tách giữa mố cầu và đường đầu cầu. |
| **CL-04** | Rãnh dọc thoát nước (`Road_Ditch`) | Cọc tiêu, biển báo, hộ lan tôn sóng | Hard Clash | **0.02 m** | Thấp (Low) | Chân trụ biển báo cắm giữa lòng rãnh -> Dời chân cột sang lề gia cố. |

---

## 2. Biểu mẫu Nhật ký Xử lý Xung đột (Issue Log Template)

| Mã Lỗi | Tọa độ (X, Y, Z) | Lý Trình | Mô Tả Va Chạm | Người Gây Lỗi | Người Phụ Trách Sửa | Trạng Thái (Status) | Hạn Chót (Deadline) | Biên Bản Xác Nhận |
|---|---|---|---|---|---|---|---|---|
| `ISS-001` | 567812.34, 1532104.56, 12.45 | Km0+650 | Đỉnh cống bê tông D100 va chạm lớp cấp phối đá dăm loại 1 (sâu 15cm) | Bộ môn Thoát nước | KS. Nguyễn Văn A | Đang xử lý (Active) | 20/10/2026 | Chờ cập nhật bản vẽ trắc dọc cống |
| `ISS-002` | 568120.10, 1532350.20, 18.20 | Km1+200 | Bản quá độ mố cầu bị lấn thể tích vào dải phân cách giữa | Bộ môn Cầu | KS. Trần Văn B | Đã duyệt sửa (Resolved) | 18/10/2026 | Đã re-test và pass |
