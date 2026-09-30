# 🌸 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG PHÂN CÔNG TRỰC & VỆ SINH 1841
> **Tone Màu**: Tím Pastel (Lavender / Lilac / Amethyst) Hiện Đại  
> **Google Sheet**: [1841 - VỆ SINH ÁP DỤNG 1/7/2026](https://docs.google.com/spreadsheets/d/1z6vAzHRIrYihI91Yw1dMnluPPL0BuAYiZarPBD5qNfw/edit?usp=sharing)  
> **Tính năng chính**: Hiển thị lên GitHub Pages, Lưu tự động về Google Sheet tức thì, Đồng bộ đa trình duyệt thời gian thực (Realtime sync < 50ms).

---

## 📁 DANH SÁCH TẬP TIN DỰ ÁN

| Tập tin | Chức năng | Nơi sử dụng |
| :--- | :--- | :--- |
| `index.html` | Toàn bộ giao diện Web App Tone Tím Pastel (HTML + CSS + JS) | Đẩy lên **GitHub Pages** (hoặc làm file `Index.html` trong Apps Script) |
| `Code_Backend.gs` | Mã nguồn Google Apps Script xử lý API đọc/ghi Google Sheet *(Khuyên dùng)* | Dán vào file `Code.gs` trong **Google Apps Script** |
| `Code.gs` | Phiên bản All-in-One tích hợp sẵn cả mã Backend và nhúng toàn bộ HTML | Dùng khi muốn chỉ tạo đúng 1 file trong **Google Apps Script** |

---

## 🚀 BƯỚC 1: CÀI ĐẶT BACKEND TRÊN GOOGLE APPS SCRIPT

1. Mở trang tính [1841 - VỆ SINH ÁP DỤNG 1/7/2026](https://docs.google.com/spreadsheets/d/1z6vAzHRIrYihI91Yw1dMnluPPL0BuAYiZarPBD5qNfw/edit?usp=sharing).
2. Trên thanh menu trên cùng, bấm chọn **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
3. **Cách thiết lập khuyên dùng (2 tệp riêng biệt, chuẩn và nhẹ nhất)**:
   - Tệp mã `Code.gs`: Xóa hết code cũ, mở tệp [`Code_Backend.gs`](./Code_Backend.gs) copy toàn bộ và dán vào.
   - Tệp HTML `Index.html`: Bấm vào dấu **+** bên cạnh mục *Trình chỉnh sửa (Editor)* ➔ Chọn **HTML** ➔ Đặt tên là `Index` (Apps Script sẽ tự thêm đuôi `.html`). Sau đó mở tệp [`index.html`](./index.html) copy toàn bộ và dán vào.
   - Bấm biểu tượng 💾 **Lưu dự án (Save project)**.
4. **Bấm Triển Khai (Deploy)**:
   - Bấm nút **Triển khai (Deploy)** màu xanh ở góc trên bên phải ➔ Chọn **Tùy chọn triển khai mới (New deployment)**.
   - Bấm vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại" ➔ Chọn **Ứng dụng web (Web app)**.
   - Cấu hình như sau:
     * **Mô tả (Description)**: `Phân công trực 1841 Tone Tím Pastel`
     * **Thực thi dưới dạng (Execute as)**: `Tôi (Me - email của bạn)`
     * **Người có quyền truy cập (Who has access)**: `Bất kỳ ai (Anyone)` *(Rất quan trọng để GitHub Pages kết nối được mà không bị chặn quyền)*
   - Bấm **Triển khai (Deploy)**.
   - Khi Google hiện cửa sổ yêu cầu cấp quyền: Bấm **Ủy quyền truy cập (Authorize access)** ➔ Chọn tài khoản Google của bạn ➔ Bấm **Nâng cao (Advanced)** ➔ Bấm **Đi tới dự án (Go to ... unsafe)** ➔ Bấm **Cho phép (Allow)**.
   - Sau khi hoàn tất, sao chép đường link **URL Ứng dụng web (Web App URL)** có định dạng:  
     `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 🌐 BƯỚC 2: ĐẨY LÊN GITHUB & KÍCH HOẠT GITHUB PAGES

1. Khởi tạo kho lưu trữ (Repository) mới trên tài khoản GitHub của bạn (ví dụ: `phancong-vesinh-1841`).
2. Tải toàn bộ các file trong thư mục này lên GitHub (đặc biệt là tệp `index.html` nằm ngay tại thư mục gốc của repository).
3. Bật GitHub Pages:
   - Trong trang Repository trên GitHub, vào mục **Settings** (Cài đặt).
   - Chọn mục **Pages** ở menu bên trái.
   - Tại phần **Build and deployment**:
     * **Source**: Chọn `Deploy from a branch`.
     * **Branch**: Chọn nhánh `main` (hoặc `master`), thư mục chọn `/ (root)`.
     * Bấm **Save**.
4. Chờ khoảng 1-2 phút, GitHub sẽ cung cấp đường link website của bạn:  
   `https://<ten-tai-khoan>.github.io/<ten-repo>/`  
   *(Ví dụ: `https://leevu221-lang.github.io/phancong-vesinh-1841/`)*.

---

## ⚡ BƯỚC 3: KẾT NỐI VÀ ĐỒNG BỘ 2 CHIỀU

1. Truy cập vào trang web GitHub Pages của bạn vừa tạo.
2. Bấm vào biểu tượng **⚙️ (Cài đặt)** ở góc trên bên phải thanh tiêu đề.
3. Dán đường link **Web App URL** bạn đã sao chép ở Bước 1 vào ô **URL Google Apps Script Web App**.
4. Bấm **Lưu Cấu Hình**.
5. **Hoàn tất!**
   - Giờ đây, khi bạn chọn nhân viên trực ở bất kỳ vị trí nào (1..15) hoặc nhập khu vực phụ trách, PG hỗ trợ: Hệ thống sẽ **tự động lưu ngay lập tức về đúng dải ô W17:Z31** trên Google Sheet.
   - Khi bạn tích điểm danh nhân viên ở Tab 3: Hệ thống sẽ **tự động đánh dấu chữ X vào dải ô AC1:AE26** trên Google Sheet.
   - Đồng thời, thông qua giao thức truyền tin thời gian thực MQTT WebSocket, **toàn bộ các trình duyệt khác của đồng nghiệp đang mở trang web cũng sẽ nhảy dữ liệu đồng bộ ngay lập tức (< 50ms) mà không cần phải tải lại trang**!

---

## 🌟 ĐIỂM NỔI BẬT CỦA GIAO DIỆN TONE TÍM PASTEL

1. **Chuẩn Thẩm Mỹ Tím Pastel (Lavender / Lilac)**:
   - Sử dụng font chữ hiện đại `Plus Jakarta Sans` kết hợp `JetBrains Mono`.
   - Hiệu ứng đổ bóng mềm, kính mờ Glassmorphism, các badge trạng thái phối màu dịu mắt.
2. **Tab 1: Phân Công Trực (15 Vị Trí)**:
   - 15 thẻ phân công trực tương ứng chính xác với 15 dòng dữ liệu (dòng 17 đến 31) trên Sheet.
   - Tự động gợi ý danh sách 26 nhân viên khi chọn.
   - Hỗ trợ tìm kiếm nhanh theo tên nhân viên, tên khu vực hoặc PG.
3. **Tab 2: Sơ Đồ Mặt Bằng Siêu Thị 1841**:
   - Trực quan hóa toàn bộ bố trí siêu thị: Vách kính, Cửa vào, Dãy Tivi 1-5, Quầy thu ngân, Tủ đông 1-2, Máy giặt 1-6, Tủ lạnh 1-4, Gia dụng 1-7, Vách bếp điện, Vách máy lạnh, Cửa kho ĐM/ICT...
   - Tự động liên kết và hiển thị tên nhân viên đang trực tương ứng ngay trên từng ô bản đồ.
4. **Tab 3: Danh Sách 26 Nhân Viên & Điểm Danh**:
   - Thống kê tổng số nhân viên, số người đang có mặt trực, số PG hỗ trợ hãng.
   - Nút bật/tắt trạng thái điểm danh đồng bộ trực tiếp cột AE trên Sheet.
5. **Tiện ích mở rộng**:
   - 📸 **Nút Xuất Ảnh HD**: Tạo ảnh chụp sắc nét lịch trực và sơ đồ mặt bằng chỉ bằng 1 cú nhấp chuột để gửi Zalo cho nhóm siêu thị.
   - 🔄 **Nút Làm Mới Nhanh**: Tải lại dữ liệu mới nhất bất cứ lúc nào.
