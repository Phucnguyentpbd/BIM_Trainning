# Biểu mẫu 02: Từ điển Thuộc tính Property Sets (PSD)

Bộ thuộc tính mở rộng (Property Set Definitions) được áp dụng đồng bộ cho các khối 3D Solid của Civil 3D và cấu kiện Revit trước khi đưa vào Navisworks và xuất IFC 4.3:

| Tên Thuộc Tính | Kiểu Dữ Liệu | Nguồn / Cách Tính | Ý Nghĩa Kỹ Thuật | Ví Dụ Giá Trị |
|---|---|---|---|---|
| `BIM_Project` | Text | Nhập tay | Tên mã dự án giao thông | `BIM Tuyến Tuy Phước 2027` |
| `BIM_ElementID` | Text | Tự động / Quy tắc | Mã định danh duy nhất của cấu kiện | `ROA-PAVE1-KM0+250-L` |
| `BIM_Discipline` | Text | Nhập tay / Layer | Bộ môn chuyên ngành | `Đường bộ` (Road) |
| `BIM_Component` | Text | Subassembly Name | Tên cấu kiện chi tiết | `Lớp BTN hạt mịn C12.5` |
| `BIM_Station_Start` | Real | Baseline Station | Lý trình bắt đầu đoạn đốt (m) | `250.00` |
| `BIM_Station_End` | Real | Baseline Station | Lý trình kết thúc đoạn đốt (m) | `300.00` |
| `BIM_Side` | Text | Assembly Side | Vị trí bên so với tim | `Left` / `Right` / `Center` |
| `BIM_Material` | Text | Code Set Style | Tên vật liệu theo thiết kế | `Asphalt Concrete C12.5` |
| `BIM_Volume` | Real | Automatic (Solid Volume) | Thể tích hình học thực tế (m³) | `18.75` |
| `BIM_Area` | Real | Automatic (Surface Area) | Diện tích bề mặt tiếp xúc (m²) | `250.00` |
| `BIM_WBS_Code` | Text | Schedule Mapping | Mã công việc trong tiến độ 4D | `WBS-3.2.1` |
| `BIM_CostCode` | Text | Cost Database | Mã định mức đơn giá dự toán | `AF.12345` |
| `BIM_Status` | Text | Lifecycle Stage | Trạng thái thiết kế / thi công | `Designed` / `Approved` / `As-Built` |
| `BIM_Contractor` | Text | Construction | Nhà thầu thi công phụ trách | `Công ty CP Xây Dựng T27` |

---

## Cách nhúng bộ thuộc tính này vào Civil 3D:
1. Gõ lệnh `PROPERTYSETDEFINE` trong Civil 3D.
2. Tạo mới Definition mang tên `BIM_Road_Attributes`.
3. Trong tab `Applies To`, tích chọn `3D Solid`, `Body`, `Corridor`.
4. Trong tab `Definition`, thêm các trường thuộc tính theo bảng trên.
5. Để tự động lấy thể tích: Thêm `Automatic Property` -> Chọn `Volume`.
