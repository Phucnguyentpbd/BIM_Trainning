# Biểu mẫu 01: Quy ước Đặt tên Tệp và Mã hóa Cấu kiện Dự án

## 1. Quy ước Đặt tên Tệp theo Tiêu chuẩn ISO 19650

Cú pháp chuẩn hóa:
`[MãDựÁn]-[BộMôn]-[HạngMục]-[KhuVực/LýTrình]-[LoạiTệp]-[GiaiĐoạn]-[PhiênBản].[ĐịnhDạng]`

### Bảng diễn giải các trường mã:

| Trường | Ký hiệu | Ý nghĩa | Ví dụ |
|---|---|---|---|
| **Mã Dự Án** | `BIM27` | Dự án BIM Tuyến 2027 | `BIM27` |
| **Bộ Môn** | `ROA` | Đường bộ (Road) | `ROA`, `BRG` (Cầu), `DRN` (Thoát nước), `GEO` (Địa kỹ thuật), `SUR` (Khảo sát) |
| **Hạng Mục** | `CORR` | Hành lang tuyến (Corridor) | `CORR`, `SLD` (3D Solids), `ABUT` (Mố cầu), `CULV` (Cống) |
| **Lý Trình** | `KM0-KM2` | Phân đoạn lý trình từ Km0 đến Km2 | `KM0-KM2`, `KM0+650` |
| **Loại Tệp** | `MOD` | Mô hình 3D (Model) | `MOD`, `DRW` (Bản vẽ 2D), `REP` (Báo cáo), `SCH` (Tiến độ) |
| **Giai Đoạn** | `TKTC` | Thiết kế thi công | `TKCS` (Cơ sở), `TKKT` (Kỹ thuật), `TKTC` (Bản vẽ thi công) |
| **Phiên Bản** | `V01` | Phiên bản phát hành số 01 | `V01`, `V02`, `P01` (Bản nháp) |

### Ví dụ áp dụng thực tế:
- Tệp Corridor Civil 3D gốc: `BIM27-ROA-CORR-KM0-KM2-MOD-TKTC-V01.dwg`
- Tệp 3D Solids trích xuất từ Corridor: `BIM27-ROA-SLD-KM0-KM2-MOD-TKTC-V01.dwg`
- Tệp NWC xuất từ Civil 3D: `BIM27-ROA-SLD-KM0-KM2-MOD-TKTC-V01.nwc`
- Tệp mố cầu Revit: `BIM27-BRG-ABUT-KM1+200-MOD-TKTC-V01.rvt`
- Tệp phối hợp tổng thể Navisworks: `BIM27-COORD-ALL-KM0-KM2-MOD-TKTC-V01.nwf`
- Cơ sở dữ liệu không gian QGIS: `BIM27-GIS-MASTER-KM0-KM2-DAT-TKTC-V01.gpkg`

---

## 2. Quy ước Đặt tên Layer trong AutoCAD / Civil 3D

- `C-ROAD-CENT`: Đường tim tuyến thiết kế.
- `C-ROAD-PAVE`: Bề mặt và các lớp áo đường bê tông nhựa.
- `C-ROAD-BASE`: Lớp móng cấp phối đá dăm.
- `C-ROAD-SUBB`: Lớp móng dưới / đệm cát.
- `C-ROAD-DAYL`: Đường ranh chân taluy đào / đắp.
- `C-DRAN-CULV`: Thân cống và bản đáy cống ngang đường.
- `C-TOPO-SURF`: Bề mặt địa hình tự nhiên hiện trạng.
- `C-TOPO-SEC-GOC`: Đường đối chiếu trắc ngang tự nhiên 2D.
