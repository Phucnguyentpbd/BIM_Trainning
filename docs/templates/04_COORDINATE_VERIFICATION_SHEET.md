# Biểu mẫu 04: Phiếu Kiểm tra & Đối soát Tọa độ Mốc Chung

Hồ sơ đối soát độ chính xác vị trí không gian giữa 4 nền tảng phần mềm: **Civil 3D — Revit — InfraWorks — QGIS**.

- **Dự án**: Tuyến đường mẫu BIM Tuyến 2027 (Chiều dài: 2,000 m).
- **Hệ quy chiếu**: VN-2000 nội bộ, Kinh tuyến trục 108°00', Múi chiếu 3 độ, Hệ cao độ Nhà nước Hòn Dấu.
- **Ngày kiểm tra**: 16/10/2026.
- **Người thực hiện**: Kỹ sư phụ trách BIM.

---

## Bảng Đối soát Tọa độ 3 Mốc Khống chế Kỹ thuật:

### 1. Mốc P1 (Đầu tuyến — Km0+000)
- Tọa độ Thiết kế Gốc (Civil 3D): $X = 567,100.000\text{ m}$; $Y = 1,531,500.000\text{ m}$; $Z = 10.500\text{ m}$.
- Tọa độ Đọc trong Revit (Shared Coordinates): $X = 567,100.000\text{ m}$; $Y = 1,531,500.000\text{ m}$; $Z = 10.500\text{ m}$ (Sai số $\Delta = 0\text{ mm}$).
- Tọa độ Đọc trong InfraWorks (Cursor Tooltip): $X = 567,100.02\text{ m}$; $Y = 1,531,500.01\text{ m}$; $Z = 10.51\text{ m}$ (Sai số $\Delta < 2\text{ cm}$ do làm tròn hiển thị).
- Tọa độ Đọc trong QGIS (Identify Tool): $X = 567,100.000\text{ m}$; $Y = 1,531,500.000\text{ m}$ (Sai số $\Delta = 0\text{ mm}$).
- **Kết luận**: ĐẠT CHUẨN.

### 2. Mốc P2 (Giữa tuyến — Km1+000, Nút giao / Cống hộp lớn)
- Tọa độ Thiết kế Gốc (Civil 3D): $X = 567,850.250\text{ m}$; $Y = 1,532,150.800\text{ m}$; $Z = 14.850\text{ m}$.
- Tọa độ Đọc trong Revit: $X = 567,850.250\text{ m}$; $Y = 1,532,150.800\text{ m}$; $Z = 14.850\text{ m}$.
- Tọa độ Đọc trong InfraWorks: $X = 567,850.24\text{ m}$; $Y = 1,532,150.81\text{ m}$; $Z = 14.85\text{ m}$.
- Tọa độ Đọc trong QGIS: $X = 567,850.250\text{ m}$; $Y = 1,532,150.800\text{ m}$.
- **Kết luận**: ĐẠT CHUẨN.

### 3. Mốc P3 (Cuối tuyến — Km2+000, Tiếp giáp Mố cầu)
- Tọa độ Thiết kế Gốc (Civil 3D): $X = 568,600.500\text{ m}$; $Y = 1,532,800.100\text{ m}$; $Z = 22.300\text{ m}$.
- Tọa độ Đọc trong Revit: $X = 568,600.500\text{ m}$; $Y = 1,532,800.100\text{ m}$; $Z = 22.300\text{ m}$.
- Tọa độ Đọc trong InfraWorks: $X = 568,600.51\text{ m}$; $Y = 1,532,800.09\text{ m}$; $Z = 22.29\text{ m}$.
- Tọa độ Đọc trong QGIS: $X = 568,600.500\text{ m}$; $Y = 1,532,800.100\text{ m}$.
- **Kết luận**: ĐẠT CHUẨN.
