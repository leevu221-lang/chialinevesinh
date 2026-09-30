/**
 * ========================================================================================
 * HỆ THỐNG PHÂN CÔNG TRỰC & VỆ SINH SIÊU THỊ 1841 - GOOGLE APPS SCRIPT
 * Bảng tính: 1841 - VỆ SINH ÁP DỤNG 1/7/2026
 * Spreadsheet ID: 1z6vAzHRIrYihI91Yw1dMnluPPL0BuAYiZarPBD5qNfw
 * ========================================================================================
 */

// ID của Bảng tính Google Sheets (mặc định lấy từ link cung cấp)
const SPREADSHEET_ID = "1z6vAzHRIrYihI91Yw1dMnluPPL0BuAYiZarPBD5qNfw";

/**
 * 1. Tự động tạo Menu trên thanh công cụ khi mở Google Sheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🧹 Phân Công Vệ Sinh 1841")
    .addItem("🔍 Mở Bảng Phân Công (Sidebar)", "showSidebar")
    .addItem("🖥️ Mở Sơ Đồ & Phân Công (Cửa sổ lớn)", "showDialog")
    .addSeparator()
    .addItem("⚡ Cài đặt & Định dạng Sheet", "setupSheetFormatting")
    .addItem("ℹ️ Hướng Dẫn Sử Dụng", "showHelp")
    .addToUi();
}

/**
 * 2. Mở form dưới dạng Sidebar bên phải màn hình
 */
function showSidebar() {
  const html = getAppHtmlOutput()
    .setTitle("Phân Công Trực Siêu Thị 1841")
    .setWidth(450);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * 3. Mở form dưới dạng Hộp thoại Dialog ở giữa màn hình
 */
function showDialog() {
  const html = getAppHtmlOutput()
    .setWidth(1100)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, "Hệ Thống Phân Công Trực & Vệ Sinh Siêu Thị 1841");
}

/**
 * 4. API tiếp nhận dữ liệu từ GitHub Pages và Web App
 */
function doGet(e) {
  return handleApiOrHtml(e);
}

function doPost(e) {
  return handleApiOrHtml(e);
}

function handleApiOrHtml(e) {
  let params = (e && e.parameter) ? Object.assign({}, e.parameter) : {};
  let postBody = null;

  if (e && e.postData && e.postData.contents) {
    try {
      postBody = JSON.parse(e.postData.contents);
      for (const k in postBody) {
        if (params[k] === undefined) params[k] = postBody[k];
      }
    } catch (err) {
      if (!params.data) params.data = e.postData.contents;
    }
  }

  // API: Lấy toàn bộ dữ liệu phân công, nhân viên và sơ đồ
  if (params && params.action === "getData") {
    const targetSheetId = params.sheetId || (postBody && postBody.sheetId) || SPREADSHEET_ID;
    const res = getShiftData(targetSheetId);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // API: Cập nhật 1 dòng phân công nhân viên trực (STT: 1..15)
  if (params && params.action === "updateShift") {
    const stt = parseInt(params.stt, 10);
    const nv = params.nv !== undefined ? String(params.nv).trim() : "";
    const kv = params.kv !== undefined ? String(params.kv).trim() : "";
    const pg = params.pg !== undefined ? String(params.pg).trim() : "";
    const targetSheetId = params.sheetId || (postBody && postBody.sheetId) || SPREADSHEET_ID;
    const res = updateShiftRow(stt, nv, kv, pg, targetSheetId);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // API: Cập nhật toàn bộ 15 dòng phân công
  if (params && params.action === "updateAllShifts") {
    const shifts = params.shifts || (postBody && postBody.shifts) || [];
    const targetSheetId = params.sheetId || (postBody && postBody.sheetId) || SPREADSHEET_ID;
    const res = updateAllShifts(shifts, targetSheetId);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // API: Điểm danh / Đánh dấu nhân viên trực (STT: 1..26)
  if (params && params.action === "toggleAttendance") {
    const stt = parseInt(params.stt, 10);
    const marked = params.marked === "true" || params.marked === true || params.marked === "X" || params.marked === "1";
    const targetSheetId = params.sheetId || (postBody && postBody.sheetId) || SPREADSHEET_ID;
    const res = toggleEmployeeAttendance(stt, marked, targetSheetId);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Trả về giao diện người dùng
  return getAppHtmlOutput();
}

/**
 * Lấy đối tượng Sheet làm việc
 */
function getTargetSheet(targetSheetId) {
  let ss = null;
  const sheetId = targetSheetId || SPREADSHEET_ID;
  try {
    if (sheetId) {
      ss = SpreadsheetApp.openById(sheetId);
    }
  } catch (e) {
    console.warn("Không mở được theo ID:", sheetId, e);
  }
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e2) {}
  }
  if (!ss) return null;
  // Lấy sheet đầu tiên hoặc sheet đang chọn
  return ss.getSheets()[0] || ss.getActiveSheet();
}

/**
 * 5. Đọc toàn bộ dữ liệu từ Sheet
 */
function getShiftData(targetSheetId) {
  try {
    const sheet = getTargetSheet(targetSheetId);
    if (!sheet) {
      return { success: false, message: "Không tìm thấy trang tính!" };
    }

    const lastRow = Math.max(sheet.getLastRow(), 45);
    const lastCol = Math.max(sheet.getLastColumn(), 32);
    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    // 1. Đọc Bảng 1: Phân công nhân viên trực (Dòng 17..31 trong Sheet => index 16..30)
    // Cột W: STT (index 22), Cột X: NV (23), Cột Y: KV (24), Cột Z: PG (25)
    const shifts = [];
    for (let r = 16; r <= 30; r++) {
      if (r < values.length) {
        const row = values[r];
        const stt = row[22] ? parseInt(row[22], 10) : (r - 15);
        const nv = row[23] ? String(row[23]).trim() : "";
        const kv = row[24] ? String(row[24]).trim() : "";
        const pg = row[25] ? String(row[25]).trim() : "";
        shifts.push({
          stt: stt,
          rowInSheet: r + 1,
          nv: nv,
          kv: kv,
          pg: pg
        });
      }
    }

    // 2. Đọc Bảng 2: Danh sách 26 Nhân viên siêu thị (Dòng 1..26 => index 0..25)
    // Cột AC: STT (index 28), Cột AD: Tên (29), Cột AE: Đánh dấu (30)
    const employees = [];
    for (let r = 0; r <= 25; r++) {
      if (r < values.length) {
        const row = values[r];
        const name = row[29] ? String(row[29]).trim() : "";
        if (name) {
          const stt = row[28] ? parseInt(row[28], 10) : (r + 1);
          const mark = row[30] ? String(row[30]).trim().toUpperCase() : "";
          const isMarked = mark === "X" || mark === "TRUE" || mark === "1";
          employees.push({
            stt: stt,
            rowInSheet: r + 1,
            name: name,
            marked: isMarked
          });
        }
      }
    }

    return {
      success: true,
      sheetTitle: sheet.getParent().getName(),
      sheetName: sheet.getName(),
      shifts: shifts,
      employees: employees,
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      message: err.toString()
    };
  }
}

/**
 * 6. Cập nhật 1 dòng phân công nhân viên trực
 */
function updateShiftRow(stt, nv, kv, pg, targetSheetId) {
  try {
    const sheet = getTargetSheet(targetSheetId);
    if (!sheet) return { success: false, message: "Không tìm thấy trang tính!" };

    const targetRow = 16 + parseInt(stt, 10);
    // Cột W: STT (23), Cột X: NV (24), Cột Y: KV (25), Cột Z: PG (26)
    if (nv !== undefined) sheet.getRange(targetRow, 24).setValue(nv);
    if (kv !== undefined) sheet.getRange(targetRow, 25).setValue(kv);
    if (pg !== undefined) sheet.getRange(targetRow, 26).setValue(pg);

    SpreadsheetApp.flush();

    return {
      success: true,
      stt: stt,
      row: targetRow,
      nv: nv,
      kv: kv,
      pg: pg,
      message: "Đã cập nhật thành công vị trí " + stt
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * 7. Cập nhật toàn bộ danh sách 15 vị trí phân công
 */
function updateAllShifts(shifts, targetSheetId) {
  try {
    const sheet = getTargetSheet(targetSheetId);
    if (!sheet) return { success: false, message: "Không tìm thấy trang tính!" };
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return { success: false, message: "Dữ liệu phân công không hợp lệ" };
    }

    const rowData = [];
    for (let i = 0; i < 15; i++) {
      const item = shifts[i] || {};
      const stt = item.stt || (i + 1);
      const nv = item.nv || "";
      const kv = item.kv || "";
      const pg = item.pg || "";
      rowData.push([stt, nv, kv, pg]);
    }

    // Ghi vào dải W17:Z31 (dòng 17, cột 23, 15 dòng, 4 cột)
    sheet.getRange(17, 23, rowData.length, 4).setValues(rowData);
    SpreadsheetApp.flush();

    return {
      success: true,
      totalUpdated: rowData.length,
      message: "Đã lưu thành công toàn bộ bảng phân công vào Google Sheet!"
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * 8. Đánh dấu điểm danh nhân viên trực
 */
function toggleEmployeeAttendance(stt, isMarked, targetSheetId) {
  try {
    const sheet = getTargetSheet(targetSheetId);
    if (!sheet) return { success: false, message: "Không tìm thấy trang tính!" };

    const targetRow = parseInt(stt, 10);
    // Cột AE (cột 31): Đánh dấu 'X' hoặc để trống
    const cell = sheet.getRange(targetRow, 31);
    cell.setValue(isMarked ? "X" : "");
    cell.setHorizontalAlignment("center");

    SpreadsheetApp.flush();

    return {
      success: true,
      stt: stt,
      row: targetRow,
      marked: !!isMarked,
      message: "Đã cập nhật điểm danh nhân viên " + stt
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * 9. Trả về giao diện HTML
 */
function getAppHtmlOutput() {
  try {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("Phân Công Trực Siêu Thị 1841 - Tone Tím Pastel")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
  } catch (e) {
    if (typeof INDEX_HTML_CONTENT !== "undefined" && INDEX_HTML_CONTENT) {
      return HtmlService.createHtmlOutput(INDEX_HTML_CONTENT)
        .setTitle("Phân Công Trực Siêu Thị 1841 - Tone Tím Pastel")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    }
    return HtmlService.createHtmlOutput("<h2>Đang tải giao diện... Vui lòng tạo tệp Index.html hoặc dùng tệp Code.gs đầy đủ.</h2>");
  }
}

/**
 * 10. Hướng dẫn sử dụng
 */
function showHelp() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    "HƯỚNG DẪN SỬ DỤNG HỆ THỐNG",
    "1. Bấm 'Mở Bảng Phân Công' để xem và chỉnh sửa phân công trực siêu thị với giao diện Tone Tím Pastel hiện đại.\n\n" +
    "2. Khi chỉnh sửa trên giao diện Web hoặc Sidebar, dữ liệu tự động cập nhật ngay về các cột W-X-Y-Z và AC-AD-AE trên Google Sheet.\n\n" +
    "3. Tất cả các trình duyệt và thiết bị sẽ tự động đồng bộ theo thời gian thực (Realtime sync).\n\n" +
    "4. Hỗ trợ nút 'Xuất Ảnh Sơ Đồ HD' để chia sẻ nhanh vào nhóm Zalo.",
    ui.ButtonSet.OK
  );
}

function setupSheetFormatting() {
  const ui = SpreadsheetApp.getUi();
  ui.alert("Thông Báo", "Trang tính đã được kết nối và sẵn sàng sử dụng!", ui.ButtonSet.OK);
}
