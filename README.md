# 🧹 Hệ Thống Phân Công Trực & Vệ Sinh Siêu Thị 1841 (Tone Tím Pastel)

> Ứng dụng Web App quản lý phân công trực siêu thị & sơ đồ vệ sinh mặt bằng siêu thị 1841.  
> Tích hợp 2 chiều với Google Sheets: [1841 - VỆ SINH ÁP DỤNG 1/7/2026](https://docs.google.com/spreadsheets/d/1z6vAzHRIrYihI91Yw1dMnluPPL0BuAYiZarPBD5qNfw/edit?usp=sharing).

---

## 🎨 Điểm Nổi Bật
- **Giao diện Tone Tím Pastel**: Thiết kế nhẹ nhàng, cao cấp với phong cách Lilac / Lavender, hiệu ứng Glassmorphism, font chữ `Plus Jakarta Sans`.
- **Đồng bộ thời gian thực (Realtime Multi-Browser Sync)**: Ứng dụng công nghệ MQTT WebSocket kết hợp `BroadcastChannel` và `localStorage` event giúp mọi thiết bị mở trang web nhận thay đổi trong vòng 20ms - 50ms mà không cần tải lại trang.
- **Lưu trực tiếp về Google Sheet ngay lập tức**: Khi chỉnh sửa vị trí trực hoặc điểm danh, dữ liệu lập tức ghi vào các dải ô `W17:Z31` và `AC1:AE26`.
- **Đọc dữ liệu siêu tốc**: Sử dụng Google Visualization API (GViz) giúp tải dữ liệu từ Sheet chỉ trong 0.2s - 0.4s mà không cần đăng nhập Google.
- **Sơ đồ mặt bằng trực quan**: Mô phỏng toàn bộ sơ đồ siêu thị 1841 (Tivi, Tủ lạnh, Máy giặt, Gia dụng, ICT, Quầy thu ngân, Vách máy lạnh...) kèm tên nhân viên phụ trách tương ứng.
- **Xuất ảnh HD**: 1 click xuất toàn bộ sơ đồ/bảng phân công ra file ảnh PNG chất lượng cao để chia sẻ Zalo nhóm.

---

## 📂 Cấu Trúc Mã Nguồn

```text
phancong-vesinh-1841/
├── index.html          # Web App giao diện Tone Tím Pastel (Triển khai GitHub Pages)
├── Code_Backend.gs     # Mã nguồn Google Apps Script (Triển khai trên Google Sheet)
├── Code.gs             # Phiên bản All-in-One nhúng giao diện HTML (Tùy chọn)
├── HD_TrienKhai.md     # Hướng dẫn chi tiết từng bước triển khai
└── README.md           # Giới thiệu dự án
```

---

## 🚀 Triển Khai Nhanh

Xem hướng dẫn chi tiết tại [HD_TrienKhai.md](./HD_TrienKhai.md).

1. **Google Apps Script**:
   - Dán `Code_Backend.gs` vào Apps Script của Google Sheet.
   - Bấm **Triển khai (Deploy)** ➔ **Ứng dụng web (Web app)** ➔ Quyền truy cập: `Bất kỳ ai (Anyone)`.
   - Lấy URL dạng `https://script.google.com/macros/s/.../exec`.
2. **GitHub Pages**:
   - Đẩy mã nguồn lên repo GitHub của bạn.
   - Vào **Settings** ➔ **Pages** ➔ Chọn nhánh `main` ➔ **Save**.
3. **Kết nối**:
   - Mở link GitHub Pages, bấm icon ⚙️ ở góc trên bên phải, dán URL Web App vào và bấm Lưu.
