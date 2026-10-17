# Module 1: Quy trình & Nền tảng BIM Tuyến (Chương 1 — 4)

## Chương 1: Bắt đầu BIM từ Corridor đã có

### Bài 1.1: Xác định đầu ra BIM thực tế sau khi hoàn thành Corridor
- **Mục tiêu**: Thiết lập được ma trận đầu ra BIM cho tuyến, phân định rõ giá trị sử dụng của từng mô hình (phối hợp, tính khối lượng, diễn họa, GIS, quản lý tiến độ thi công).
- **Dữ liệu đầu vào**: Bản sao tệp DWG Corridor đã thiết kế xong hình học (tuyến mẫu 2 km); danh sách cấu kiện Revit bàn giao từ bộ môn cầu/hầm/thoát nước.
- **Thao tác từng bước**:
  1. *Liệt kê bên liên quan*: Lập bảng gồm Chủ nhiệm đồ án, Kỹ sư cầu đường, Kỹ sư dự toán, Đơn vị thẩm tra, Ban QLDA. Xác định từng câu hỏi kỹ thuật cụ thể mà mô hình cần giải đáp.
  2. *Chọn mục tiêu sử dụng mô hình*: Gán mã mục tiêu (Clash Detection, Quantity Takeoff, Presentation, GIS Integration, 4D Phasing).
  3. *Ghép đầu ra với nguồn dữ liệu*: Civil 3D giữ hình học tuyến; Revit giữ cấu kiện nhân tạo; Navisworks quản lý mô hình tổng hợp; InfraWorks diễn họa bối cảnh; QGIS quản lý bình đồ và ranh GPMB.
  4. *Thiết lập cổng kiểm soát chất lượng (QC Gate)*: Quy định tiêu chí nghiệm thu cho từng giai đoạn (mốc tọa độ, độ kín bề mặt, độ đầy đủ thuộc tính).
  5. *Chọn đoạn tuyến thí điểm (Pilot Section)*: Khoanh vùng đoạn 200 m (chứa đường cong, cống ngang hoặc tiếp giáp mố cầu) để vận hành thử nghiệm toàn bộ luồng công việc trước khi triển khai 2 km.
- **Kết quả cần thấy**: Bảng phân bổ mục tiêu và ma trận trách nhiệm hoàn chỉnh, có chữ ký xác nhận của các bộ môn.
- **Cách kiểm tra**: Đối soát ít nhất 3 câu hỏi thực tế của kỹ sư thi công xem mô hình có trả lời được không mà không cần mở bản vẽ 2D.
- **Lỗi thường gặp & Cách xử lý**: Xem file 3D thuần túy là mô hình BIM -> Bổ sung thuộc tính phi hình học và quy trình cập nhật liên kết.

### Bài 1.2: Lập bảng trách nhiệm và yêu cầu thông tin trao đổi (EIR/BEP)
- **Mục tiêu**: Xác định chính xác thông tin bạn tự tạo và thông tin bắt buộc phải tiếp nhận từ các thành viên khác trong dự án.
- **Dữ liệu đầu vào**: Ma trận đầu ra từ Bài 1.1; danh mục cấu kiện cầu cống Revit.
- **Thao tác từng bước**:
  1. Chọn tình huống phối hợp cống ngang tại Km0+650: phân rã thành nền đường, thân cống, hố thu, gia cố mái ta-luy.
  2. Xác định các trường thông tin tối thiểu: Mã đối tượng, Tên cấu kiện, Lý trình đầu/cuối, Vật liệu, Giai đoạn thi công, Đơn vị thiết kế.
  3. Phân quyền cập nhật và thẩm quyền phê duyệt thay đổi hình học.
- **Sản phẩm bàn giao**: Từ điển thông tin tối thiểu và biên bản thống nhất ranh giới trách nhiệm mô hình hóa.

### Bài 1.3: Tạo vòng thực hành nhỏ (Sprint) trước khi làm toàn tuyến
- **Mục tiêu**: Đóng băng dữ liệu mẫu, thiết lập chu kỳ phản hồi nhanh trong 1 tuần trên đoạn thí điểm 200 m.
- **Thao tác**: Thiết lập thư mục Snapshot, kiểm tra xung đột sơ bộ, xuất thử NWC, nhập thử InfraWorks và QGIS.
- **Sản phẩm**: Nhật ký thử nghiệm vòng 1 kèm danh sách các điểm nghẽn phát hiện.

---

## Chương 2: Tổ chức CDE, Thư mục và Quy ước Tên file

### Bài 2.1: Cấu trúc thư mục dự án theo ISO 19650
- **Mục tiêu**: Thiết lập cấu trúc thư mục CDE (Common Data Environment) chuẩn hóa, phân tách 4 trạng thái dữ liệu: `01_WIP` (Work In Progress), `02_SHARED` (Chia sẻ), `03_PUBLISHED` (Phát hành), `04_ARCHIVE` (Lưu trữ).
- **Thao tác**:
  1. Tạo cây thư mục gốc cho dự án BIM Tuyến 2027 trên ổ đĩa làm việc.
  2. Phân quyền truy cập theo vai trò (Người thiết kế chỉ ghi vào WIP; Chủ trì duyệt chuyển sang SHARED).
  3. Đặt quy tắc lưu trữ snapshot định kỳ để tránh ghi đè dữ liệu.
- **Sản phẩm**: Cây thư mục dự án chuẩn hóa sẵn sàng tiếp nhận dữ liệu.

### Bài 2.2: Quy ước đặt tên file và mã hóa hạng mục
- **Mục tiêu**: Áp dụng công thức đặt tên file chuẩn: `[MãDựÁn]-[BộMôn]-[HạngMục]-[GiaiĐoạn]-[LoạiTệp]-[PhiênBản]`.
- **Ví dụ**: `BIM27-ROA-CORR-TKTC-MOD-V01.dwg`, `BIM27-BRG-ABUT-TKTC-MOD-V01.rvt`.
- **Cách kiểm tra**: Tìm kiếm tệp tin bằng bộ lọc Windows Explorer hoặc công cụ quản trị theo mã không bị nhầm lẫn phiên bản.

### Bài 2.3: Quản lý Data Shortcuts và nguồn tham chiếu ngoài (XREF)
- **Mục tiêu**: Đồng bộ hóa Alignment, Profile, Surface qua Data Shortcuts của Civil 3D; quản lý XREF bản vẽ mặt bằng và trắc dọc mà không gây nặng file.
- **Lưu ý**: Khóa thư mục Working Folder của Data Shortcuts; kiểm tra đường dẫn Relative Paths trước khi chuyển giao.

---

## Chương 3: Kiểm tra và Làm sạch Corridor Đầu vào

### Bài 3.1: Kiểm tra Baseline, Region và Tần suất cọc (Frequency)
- **Mục tiêu**: Rà soát toàn bộ các phân đoạn Corridor, đảm bảo không có khoảng hở (gaps) hoặc chồng lấn giữa các Region.
- **Tham chiếu tài liệu**: tài liệu VSI Academy về kiểm soát Corridor Target trong thư mục Google Drive BIM dùng chung; cần quyền truy cập và đối chiếu Autodesk Help 2027.
- **Thao tác**:
  1. Mở Corridor Properties -> Tab Parameters.
  2. Kiểm tra Frequency: Đoạn thẳng đặt 10-20m; đoạn cong tròn và cong chuyển tiếp bắt buộc rút ngắn xuống 2-5m.
  3. Bật tùy chọn chèn cọc tại các điểm hình học đặc biệt (Horizontal Geometry Points, Superelevation Critical Points).
- **Kết quả**: Đường biên hành lang tuyến mượt mà, không bị gãy góc hay vỡ hình học 3D.

### Bài 3.2: Kiểm soát Corridor Targets (Surface, Offset, Elevation)
- **Mục tiêu**: Kiểm tra liên kết Target của các Subassembly taluy (Daylight) vào bề mặt địa hình tự nhiên và mở rộng bụng đường cong.
- **Tiêu chí kiểm tra**: Không có cọc nào bị báo lỗi `Target not found` trong thẻ Event Viewer của Civil 3D.

### Bài 3.3: Tạo Corridor Surface và Xử lý Biên Outer Boundary
- **Mục tiêu**: Tạo bề mặt thiết kế mặt đường (Top Surface) và đáy áo đường (Datum Surface); gán Outer Boundary bám theo Daylight Cut/Fill.
- **Lỗi thường gặp**: Hiện tượng "quạt xoáy" tam giác tràn ra ngoài phạm vi tuyến do thiếu ranh giới ngoài.
- **Cách sửa**: Thêm Corridor Boundary loại "Corridor extents as outer boundary" hoặc định nghĩa ranh giới từ Feature Line mép ngoài cùng.

---

## Chương 4: Hệ Tọa độ, Cao độ và Mốc Kiểm tra Liên bộ môn

### Bài 4.1: Thiết lập hệ tọa độ VN-2000 trong Civil 3D và đối chiếu Revit
- **Mục tiêu**: Đảm bảo tệp DWG Civil 3D được định vị đúng kinh tuyến trục địa phương (ví dụ KTT 108°00' hoặc 108°30' múi chiếu 3 độ tỉnh Bình Định/Gia Lai).
- **Thao tác**:
  1. Lệnh `EDITDRAWINGSETTINGS` -> Tab Units and Zone.
  2. Chọn Datum VN-2000 và mã Zone tương ứng.
  3. Lập bảng tọa độ 3 mốc khống chế chính (P1, P2, P3) trải dài trên tuyến 2 km gồm các giá trị X (Easting), Y (Northing), Z (Elevation).
- **Phối hợp với Revit**: Xuất Shared Coordinates từ Civil 3D sang DWG để team Revit liên kết tọa độ qua Shared Coordinate System, không để mô hình công trình nằm ở gốc tọa độ giả định (0,0,0).

### Bài 4.2: Phiếu nghiệm thu mốc tọa độ và cao độ chung
- **Sản phẩm**: Lập bảng Excel đối soát sai số tọa độ giữa Civil 3D, Revit, InfraWorks và QGIS; sai số mặt bằng phải < 1mm trong mô hình kỹ thuật.
