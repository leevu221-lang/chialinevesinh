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

  // API: Tạo / Khởi tạo tab 'save data'
  if (params && (params.action === "createSaveDataSheet" || params.action === "initSaveData")) {
    const targetSheetId = params.sheetId || (postBody && postBody.sheetId) || SPREADSHEET_ID;
    const res = initOrGetSaveDataSheet(targetSheetId);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
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

  // API: Cập nhật toàn bộ danh sách Nhân viên & PG (Thêm/Sửa/Xóa)
  if (params && params.action === "updateAllEmployees") {
    const employees = params.employees || (postBody && postBody.employees) || [];
    const targetSheetId = params.sheetId || (postBody && postBody.sheetId) || SPREADSHEET_ID;
    const res = updateAllEmployees(employees, targetSheetId);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Trả về giao diện người dùng
  return getAppHtmlOutput();
}

/**
 * Lấy đối tượng Sheet làm việc
 */

/**
 * Lấy hoặc Tự động tạo Sheet 'save data' để lưu dữ liệu từ Web App
 */
function getSaveDataSheet(targetSheetId) {
  let ss = null;
  const sheetId = targetSheetId || SPREADSHEET_ID;
  try {
    if (sheetId) ss = SpreadsheetApp.openById(sheetId);
  } catch (e) {}
  if (!ss) {
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e2) {}
  }
  if (!ss) return null;

  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === "save data") {
      return sheets[i];
    }
  }

  // Nếu chưa có thì tạo mới
  const newSheet = ss.insertSheet("save data");
  setupSaveDataSheetFormatting(newSheet, ss);
  return newSheet;
}

/**
 * Khởi tạo định dạng & dữ liệu mẫu cho tab 'save data'
 */
function setupSaveDataSheetFormatting(sheet, ss) {
  try {
    // 1. Độ rộng các cột
    sheet.setColumnWidth(1, 55);   // A: STT Ca
    sheet.setColumnWidth(2, 170);  // B: NV
    sheet.setColumnWidth(3, 260);  // C: KV
    sheet.setColumnWidth(4, 170);  // D: PG
    sheet.setColumnWidth(5, 25);   // E: Trống
    sheet.setColumnWidth(6, 55);   // F: STT NV
    sheet.setColumnWidth(7, 210);  // G: Họ Tên
    sheet.setColumnWidth(8, 130);  // H: Phân Loại
    sheet.setColumnWidth(9, 100);  // I: Điểm Danh
    sheet.setColumnWidth(10, 25);  // J: Trống
    sheet.setColumnWidth(11, 160); // K: Thông số
    sheet.setColumnWidth(12, 220); // L: Giá trị

    // 2. Tiêu đề khối
    // Khối 1: Ca trực
    sheet.getRange("A1:D1").merge()
      .setValue("BẢNG PHÂN CÔNG 15 VỊ TRÍ TRỰC (VỆ SINH 1841)")
      .setBackground("#fef3c7").setFontColor("#92400e").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(12);

    sheet.getRange("A2:D2").setValues([["STT", "NHÂN VIÊN", "KHU VỰC PHÂN CÔNG", "PG HỖ TRỢ HÃNG"]])
      .setBackground("#fde68a").setFontColor("#78350f").setFontWeight("bold").setHorizontalAlignment("center");

    // Khối 2: Danh sách nhân sự
    sheet.getRange("F1:I1").merge()
      .setValue("DANH SÁCH NHÂN SỰ (NV & PG SIÊU THỊ 1841)")
      .setBackground("#fef3c7").setFontColor("#92400e").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(12);

    sheet.getRange("F2:I2").setValues([["STT", "HỌ VÀ TÊN", "PHÂN LOẠI", "ĐIỂM DANH (X)"]])
      .setBackground("#fde68a").setFontColor("#78350f").setFontWeight("bold").setHorizontalAlignment("center");

    // Khối 3: Thông tin đồng bộ
    sheet.getRange("K1:L1").merge()
      .setValue("THÔNG TIN ĐỒNG BỘ WEB APP")
      .setBackground("#fef3c7").setFontColor("#92400e").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(12);

    sheet.getRange("K2:L2").setValues([["THÔNG SỐ", "GIÁ TRỊ"]])
      .setBackground("#fde68a").setFontColor("#78350f").setFontWeight("bold").setHorizontalAlignment("center");

    sheet.getRange("K3:L6").setValues([
      ["Thời gian lưu cuối:", new Date().toLocaleString("vi-VN")],
      ["Nguồn lưu dữ liệu:", "Web App GitHub Pages"],
      ["Tổng số nhân sự:", '=COUNTA(G3:G100)'],
      ["Đang có mặt:", '=COUNTIF(I3:I100, "X")']
    ]);
    sheet.getRange("K3:K6").setFontWeight("bold").setFontColor("#78350f");

    // Đọc dữ liệu từ sheet cũ nếu có để điền ban đầu vào save data
    let oldSheet = null;
    const allSheets = ss.getSheets();
    for (let i = 0; i < allSheets.length; i++) {
      if (allSheets[i].getName() !== "save data") {
        oldSheet = allSheets[i];
        break;
      }
    }

    if (oldSheet) {
      const oldVals = oldSheet.getRange(1, 1, Math.max(oldSheet.getLastRow(), 40), 32).getValues();
      
      // Copy 15 ca trực từ W17:Z31
      const initialShifts = [];
      for (let r = 16; r <= 30; r++) {
        const row = oldVals[r] || [];
        initialShifts.push([row[22] || (r - 15), row[23] || "", row[24] || "", row[25] || ""]);
      }
      sheet.getRange(3, 1, 15, 4).setValues(initialShifts);

      // Copy danh sách nhân viên từ AC1:AE26
      const initialEmps = [];
      for (let r = 0; r < 35; r++) {
        const row = oldVals[r] || [];
        const name = row[29] ? String(row[29]).trim() : "";
        if (name) {
          const stt = row[28] || (initialEmps.length + 1);
          const mark = (String(row[30]).toUpperCase() === "X" || row[30] === true) ? "X" : "";
          const isPg = /pg|tcl|lg|oppo|vivo|realme|xiaomi|aqua|toshiba|sunhouse|bluestone|karofi|mutosi/i.test(name);
          initialEmps.push([stt, name, isPg ? "PG Hãng" : "NV Siêu Thị", mark]);
        }
      }
      if (initialEmps.length > 0) {
        sheet.getRange(3, 6, initialEmps.length, 4).setValues(initialEmps);
      }
    }

    // Kẻ viền bảng cho đẹp mắt
    sheet.getRange("A2:D17").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange("F2:I35").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange("K2:L6").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

    SpreadsheetApp.flush();
  } catch (err) {
    console.warn("Lỗi setupSaveDataSheetFormatting:", err);
  }
}

/**
 * API khởi tạo thủ công tab 'save data'
 */
function initOrGetSaveDataSheet(targetSheetId) {
  try {
    const sheet = getSaveDataSheet(targetSheetId);
    return {
      success: true,
      sheetName: sheet.getName(),
      message: "Đã tạo / kết nối thành công sheet 'save data'!"
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

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

    // Kiểm tra xem sheet 'save data' có tồn tại không
    let saveSheet = null;
    try {
      const ss = sheet.getParent();
      saveSheet = ss.getSheetByName("save data") || ss.getSheetByName("Save Data");
    } catch(e) {}

    const shifts = [];
    const employees = [];

    if (saveSheet && saveSheet.getLastRow() >= 3) {
      // ĐỌC TRỰC TIẾP TỪ SHEET 'save data'
      const saveVals = saveSheet.getRange(1, 1, Math.max(saveSheet.getLastRow(), 35), 12).getValues();
      
      // 1. Đọc 15 ca trực từ A3:D17
      for (let r = 2; r <= 16; r++) {
        const row = saveVals[r] || [];
        const stt = row[0] ? parseInt(row[0], 10) : (r - 1);
        const nv = row[1] ? String(row[1]).trim() : "";
        const kv = row[2] ? String(row[2]).trim() : "";
        const pg = row[3] ? String(row[3]).trim() : "";
        shifts.push({ stt: stt, rowInSheet: r + 1, nv: nv, kv: kv, pg: pg });
      }

      // 2. Đọc danh sách NV/PG từ F3:I60
      for (let r = 2; r < saveVals.length; r++) {
        const row = saveVals[r] || [];
        const name = row[6] ? String(row[6]).trim() : "";
        if (name) {
          const stt = row[5] ? parseInt(row[5], 10) : (employees.length + 1);
          const role = (row[7] && String(row[7]).includes("PG")) ? "pg" : "nv";
          const mark = row[8] ? String(row[8]).trim().toUpperCase() : "";
          const isMarked = mark === "X" || mark === "TRUE" || mark === "1";
          employees.push({ stt: stt, rowInSheet: r + 1, name: name, role: role, marked: isMarked });
        }
      }
    } else {
      // ĐỌC TỪ SHEET GỐC (VS CŨ) VÀ KHỞI TẠO TAB 'save data'
      const lastRow = Math.max(sheet.getLastRow(), 45);
      const lastCol = Math.max(sheet.getLastColumn(), 32);
      const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

      for (let r = 16; r <= 30; r++) {
        if (r < values.length) {
          const row = values[r];
          const stt = row[22] ? parseInt(row[22], 10) : (r - 15);
          shifts.push({
            stt: stt,
            rowInSheet: r + 1,
            nv: row[23] ? String(row[23]).trim() : "",
            kv: row[24] ? String(row[24]).trim() : "",
            pg: row[25] ? String(row[25]).trim() : ""
          });
        }
      }

      const maxEmpRow = Math.min(values.length, 60);
      for (let r = 0; r < maxEmpRow; r++) {
        const row = values[r];
        const name = row[29] ? String(row[29]).trim() : "";
        if (name) {
          const stt = row[28] ? parseInt(row[28], 10) : (employees.length + 1);
          const mark = row[30] ? String(row[30]).trim().toUpperCase() : "";
          employees.push({
            stt: stt,
            rowInSheet: r + 1,
            name: name,
            marked: (mark === "X" || mark === "TRUE" || mark === "1")
          });
        }
      }

      // Tự động tạo và chuẩn bị tab 'save data'
      try {
        getSaveDataSheet(targetSheetId);
      } catch(e) {}
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

    // 1. ƯU TIÊN GHI VÀO TAB 'save data' (Cột A..D, dòng 3..17)
    const saveSheet = getSaveDataSheet(targetSheetId);
    if (saveSheet) {
      saveSheet.getRange(3, 1, rowData.length, 4).setValues(rowData);
      saveSheet.getRange("L3").setValue(new Date().toLocaleString("vi-VN"));
    }

    // 2. Đồng thời ghi vào sheet gốc (Cột W17:Z31) nếu có
    try {
      const sheet = getTargetSheet(targetSheetId);
      if (sheet && sheet.getName() !== "save data") {
        sheet.getRange(17, 23, rowData.length, 4).setValues(rowData);
      }
    } catch(e) {}

    SpreadsheetApp.flush();

    return {
      success: true,
      totalUpdated: rowData.length,
      message: "Đã lưu thành công 15 ca trực vào sheet 'save data'!"
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
 * 9. Cập nhật toàn bộ danh sách Nhân viên & PG (Thêm/Sửa/Xóa)
 */
function updateAllEmployees(employees, targetSheetId) {
  try {
    if (!Array.isArray(employees)) {
      return { success: false, message: "Dữ liệu danh sách NV/PG không hợp lệ" };
    }

    // 1. ƯU TIÊN GHI VÀO TAB 'save data' (Cột F..I, dòng 3..N)
    const saveSheet = getSaveDataSheet(targetSheetId);
    if (saveSheet) {
      // Xóa vùng dữ liệu nhân viên cũ (F3:I100)
      saveSheet.getRange(3, 6, 80, 4).clearContent();

      if (employees.length > 0) {
        const rowData = [];
        for (let i = 0; i < employees.length; i++) {
          const emp = employees[i] || {};
          const stt = emp.stt || (i + 1);
          const name = emp.name ? String(emp.name).trim() : "";
          const isPg = emp.role === "pg" || /pg|tcl|lg|oppo|vivo|realme|xiaomi|aqua|toshiba|sunhouse|bluestone|karofi|mutosi/i.test(name);
          const roleLabel = isPg ? "PG Hãng" : "NV Siêu Thị";
          const mark = (emp.marked === true || emp.marked === "X" || emp.marked === "1") ? "X" : "";
          rowData.push([stt, name, roleLabel, mark]);
        }
        saveSheet.getRange(3, 6, rowData.length, 4).setValues(rowData);
        saveSheet.getRange("L3").setValue(new Date().toLocaleString("vi-VN"));
      }
    }

    // 2. Ghi song song vào cột AC..AE của sheet gốc (nếu có)
    try {
      const sheet = getTargetSheet(targetSheetId);
      if (sheet && sheet.getName() !== "save data") {
        sheet.getRange(1, 29, 60, 3).clearContent();
        if (employees.length > 0) {
          const rowDataOld = [];
          for (let i = 0; i < employees.length; i++) {
            const emp = employees[i] || {};
            const stt = emp.stt || (i + 1);
            const name = emp.name ? String(emp.name).trim() : "";
            const mark = (emp.marked === true || emp.marked === "X" || emp.marked === "1") ? "X" : "";
            rowDataOld.push([stt, name, mark]);
          }
          sheet.getRange(1, 29, rowDataOld.length, 3).setValues(rowDataOld);
        }
      }
    } catch(e) {}

    SpreadsheetApp.flush();

    return {
      success: true,
      totalUpdated: employees.length,
      message: "Đã cập nhật danh sách " + employees.length + " NV/PG vào sheet 'save data'!"
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * 10. Trả về giao diện HTML
 */
function getAppHtmlOutput() {
  try {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("Phân Công Trực Siêu Thị 1841 - Tone Vàng Pastel")
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

/**
 * Hàm gọi từ Menu Google Sheet: Tạo tab 'save data'
 */
function menuInitSaveDataSheet() {
  const ui = SpreadsheetApp.getUi();
  try {
    const res = initOrGetSaveDataSheet();
    ui.alert("Thành Công", "Đã tạo và định dạng thành công tab 'save data' trên trang tính!", ui.ButtonSet.OK);
  } catch (err) {
    ui.alert("Lỗi", err.toString(), ui.ButtonSet.OK);
  }
}
