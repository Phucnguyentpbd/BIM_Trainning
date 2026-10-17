# Biểu mẫu 06: Bảng Ánh xạ Thuộc tính BIM sang GIS (GeoPackage)

Bảng quy định việc chuyển đổi và chuẩn hóa trường thông tin khi xuất dữ liệu từ **Civil 3D / Revit (Property Sets)** sang **QGIS (Lớp Vector GeoPackage / Shapefile)**:

| Tên Trường Thuộc Tính BIM (Property Sets) | Tên Cột Trong QGIS (GeoPackage Field) | Kiểu Dữ Liệu GIS | Độ Rộng / Quy Cách | Mục Đích Sử Dụng Trong GIS |
|---|---|---|---|---|
| `BIM_ElementID` | `element_id` | String (Text) | 50 ký tự | Khóa chính (Primary Key) liên kết dữ liệu giữa mô hình 3D và GIS. |
| `BIM_Discipline` | `discipline` | String (Text) | 20 ký tự | Phân loại bộ môn: `Road`, `Bridge`, `Drainage`. |
| `BIM_Component` | `comp_name` | String (Text) | 100 ký tự | Tên hiển thị nhãn (Label) trên bản đồ hành lang. |
| `BIM_Station_Start` | `sta_start` | Real (Double) | Precision: 2 | Lọc và truy vấn đối tượng theo lý trình đầu. |
| `BIM_Station_End` | `sta_end` | Real (Double) | Precision: 2 | Lọc và truy vấn đối tượng theo lý trình cuối. |
| `BIM_Material` | `material` | String (Text) | 50 ký tự | Tô màu bản đồ chuyên đề theo loại vật liệu xây dựng. |
| `BIM_Volume` | `volume_m3` | Real (Double) | Precision: 2 | Thống kê tổng hợp khối lượng theo địa bàn từng xã/huyện. |
| `BIM_CostCode` | `cost_code` | String (Text) | 30 ký tự | Tra cứu đơn giá dự toán. |
| `BIM_Status` | `status` | String (Text) | 30 ký tự | Hiển thị tiến độ giải tỏa mặt bằng / thi công trên WebGIS. |
| Đường dẫn tệp đính kèm | `doc_url` | String (Text) | 255 ký tự | Siêu liên kết (Hyperlink) mở bản vẽ nghiệm thu hoặc ảnh hiện trường. |

---

## Quy trình làm sạch dữ liệu trước khi chuyển giao:
1. **Kiểm tra trùng mã (`element_id`)**: Trong QGIS, chạy công cụ `Find Duplicate Geometries` và `Check Duplicates in Attribute Table`.
2. **Khử ký tự đặc biệt**: Tên cột trong GeoPackage chỉ dùng chữ cái Latin thường, số và dấu gạch dưới `_`, không dùng dấu tiếng Việt và dấu cách trống để tương thích với các máy chủ WebGIS (Geoserver, Mapbox, QGIS Cloud).
3. **Đóng gói đường dẫn tương đối**: Dự án QGIS `.qgz` và tệp `.gpkg` phải nằm trong cùng thư mục để khi copy sang máy khác không bị đứt liên kết dữ liệu (Broken Data Source).
