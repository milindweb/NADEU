/**
 * config.gs - Central configuration for NAD Employees Union
 * Update all Sheet IDs before deployment
 */

var CONFIG = {
  // ===== SPREADSHEET IDs (UPDATE THESE) =====
  authSheetId: '1hk3FWRTFcQbwfuTYhtKPWZfDmHLxqzCtGjzpfYteUYk',
  employeeSheetId: '1y22M8qo2aK4DFYsI7S7nLDzP33GFbzo9TsDlEX1jL98',
  receiptSheetId: '1CzgHgaqE48IyFdCIKDbH0bW_fuHjXpgLsDYSKWXllVU',

  // ===== SHEET/TABS NAMES =====
  auth: {
    usersSheet: 'Users',
    sessionsSheet: 'Sessions'
  },
  employee: {
    sheetName: 'Employees'
  },
  receipt: {
    sheetName: 'Receipts'
  },

  // ===== MODULE NAMES =====
  modules: {
    RECEIPT: 'receipt'
  },

  // ===== DEFAULT ADMIN (created on first setup) =====
  defaultAdmin: {
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    email: 'admin@nadeu.local',
    mobile: '9999999999'
  }
};

// ===== HELPER FUNCTIONS =====

function ss_(sheetId) {
  return SpreadsheetApp.openById(sheetId);
}

function getSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeader_(sheet, headers) {
  var range = sheet.getRange(1, 1, 1, headers.length);
  var existing = range.getValues()[0];
  var needsUpdate = false;
  for (var i = 0; i < headers.length; i++) {
    if (String(existing[i] || '').trim() !== String(headers[i]).trim()) {
      needsUpdate = true;
      break;
    }
  }
  if (needsUpdate) {
    range.setValues([headers]);
    range.setFontWeight('bold');
    range.setBackground('#1a3a5f');
    range.setFontColor('white');
  }
}

function rowsToObjects_(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    row._row = i + 1;
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    result.push(row);
  }
  return result;
}

function nowIST_() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail_(msg, code) {
  return json_({ ok: false, error: msg, code: code || 400 });
}