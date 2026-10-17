# Module 5: Ứng dụng QGIS & Bản đồ Chia sẻ (Chương 18 — 21)

## Chương 18: QGIS Nền tảng cho Kỹ sư Tuyến và Chuẩn hóa Hệ Tọa độ

### Bài 18.1: Thiết lập Dự án QGIS và Hệ quy chiếu VN-2000
- **Mục tiêu**: Nắm vững nguyên lý hệ tọa độ phẳng trong GIS, phân biệt dứt khoát giữa việc **Gán hệ tọa độ (Set Layer CRS)** và **Chuyển hệ tọa độ (Reproject Layer)**.
- **Thao tác**:
  1. Khởi động QGIS (phiên bản 3.34 LTR).
  2. Tạo dự án mới, cài đặt Project CRS về đúng kinh tuyến trục địa phương (ví dụ: EPSG:5899 - WGS 84 / UTM zone 48N hoặc định nghĩa CRS người dùng cho VN-2000 nội bộ).
  3. Nhập dữ liệu tham chiếu nền: Tải lớp OpenStreetMap và Google Satellite qua plugin QuickMapServices.
- **Quy tắc vàng**: Không chỉ nhìn bằng mắt sự trùng khớp trên ảnh vệ tinh. Bắt buộc đo tọa độ tại 3 mốc khống chế kỹ thuật P1, P2, P3 để kiểm tra sai số.

### Bài 18.2: Nạp dữ liệu Địa hình và Ranh giới Hành chính
- **Dữ liệu Google Drive**: sử dụng tệp raster DEM và lớp vector ranh hành chính trong kho Drive dự án đã được cấp quyền.
- **Thực hiện**: Tạo đường đồng mức tự động (Contour lines bước 5m/25m) từ DEM và đổ màu phân tầng độ cao (Hillshade & Hypsometric Tinting).

---

## Chương 19: Chuyển Dữ liệu Civil/BIM sang Dữ liệu GIS

### Bài 19.1: Trích xuất Dữ liệu Tuyến từ Civil 3D sang Định dạng Trung gian
- **Mục tiêu**: Tách các đối tượng hình học cần quản lý bản đồ:
  - Tim tuyến (Centerline) -> Lớp đường Polyline 2D/3D.
  - Cọc lý trình (Chainage Points) -> Lớp điểm kèm nhãn Km/Lý trình.
  - Ranh chiếm dụng đất / Ranh giải phóng mặt bằng (GPMB) -> Lớp vùng Polygon.
  - Vị trí cống ngang, biển báo, công trình cầu -> Lớp điểm (Point Layer).
- **Thao tác**: Xuất từ Civil 3D qua định dạng DXF/Shapefile hoặc sử dụng công cụ MAPEXPORT của AutoCAD Map 3D.

### Bài 19.2: Tổ chức Cơ sở Dữ liệu Không gian GeoPackage (.gpkg)
- **Mục tiêu**: Tập hợp tất cả các lớp vector vào duy nhất một tệp cơ sở dữ liệu không gian mở GeoPackage (`BIM27_TUYEN_DATA.gpkg`).
- **Xây dựng Bảng thuộc tính chuẩn hóa**:
  - `ID`: Mã đối tượng duy nhất (khớp 100% với `BIM_ElementID` của Civil 3D / Navisworks).
  - `Tuyen_Ma`: Mã tuyến đường.
  - `LyTrinh_Dau`: Lý trình bắt đầu (dạng số thực, ví dụ: 250.0).
  - `LyTrinh_Cuoi`: Lý trình kết thúc.
  - `Loai_KetCau`: Mặt đường BTN, Nền đắp, Cống tròn D150, Cầu bản.
  - `Ranh_GPMB`: Trạng thái giải tỏa (Đã đền bù / Chưa đền bù).
  - `HoSo_Link`: Đường dẫn tương đối trỏ về file hồ sơ thiết kế PDF hoặc biên bản kiểm tra.

---

## Chương 20: Phân tích Không gian Hành lang Tuyến bằng QGIS

### Bài 20.1: Tạo Vùng đệm An toàn Giao thông (Buffer Zone)
- **Mục tiêu**: Tạo vùng đệm hành lang an toàn đường bộ theo quy định pháp luật (ví dụ: hành lang bảo vệ 10m tính từ chân taluy đắp hoặc mép rãnh đỉnh taluy đào).
- **Thao tác**: Sử dụng công cụ `Vector -> Geoprocessing Tools -> Buffer`, nhập cự ly đệm và kiểm tra ranh giới bao quanh tuyến.

### Bài 20.2: Phân tích Giao cắt (Intersection) và Thống kê Thu hồi Đất
- **Mục tiêu**: chồng lớp vùng đệm GPMB lên lớp ranh giới hiện trạng sử dụng đất và ranh hành chính xã/huyện từ bộ dữ liệu dự án.
- **Kết quả đầu ra**: Tự động xuất bảng Excel thống kê diện tích chiếm dụng theo từng loại đất (Đất lúa, Đất rừng sản xuất, Đất thổ cư) và số lượng hộ dân bị ảnh hưởng dọc theo từng lý trình.

---

## Chương 21: Bàn giao Bản đồ Chia sẻ: PDF, KML/KMZ và Google My Maps

### Bài 21.1: Biên tập và Xuất Bản đồ PDF Chuyên nghiệp (Print Layout)
- **Mục tiêu**: Trình bày bản đồ hành lang tuyến hoàn chỉnh trên khổ giấy A3/A1.
- **Yêu cầu biên tập**: Có khung tên chuẩn, thước tỷ lệ thanh (Scale Bar), mũi tên chỉ hướng Bắc (North Arrow), bảng chú giải (Legend), lưới tọa độ VN-2000 (Grid ticks) và thông tin xuất bản.

### Bài 21.2: Đóng gói KMZ cho Google Earth và My Maps
- **Mục tiêu**: Cung cấp dữ liệu trực quan cho ban lãnh đạo và các đoàn kiểm tra hiện trường có thể xem ngay trên điện thoại thông minh hoặc máy tính bảng.
- **Thao tác**:
  1. Chuyển đổi hệ tọa độ lớp dữ liệu sang WGS 84 (EPSG:4326).
  2. Xuất lớp đường và lớp cọc mốc ra tệp KMZ kèm thông tin bảng thuộc tính thu gọn (Popup Balloon).
  3. Kiểm tra hiển thị trong Google Earth: Vị trí tim tuyến và cống phải trùng khít với địa hình thực địa 3D.
  4. Hướng dẫn nạp KMZ lên Google My Maps để chia sẻ qua liên kết cho toàn bộ tổ chức cùng theo dõi tiến độ mặt bằng.
