/**
 * employee.gs - Employee Master module
 * Standalone employee management (no seniority sync)
 */

// ---------- Schema ----------
var EMPLOYEE_DEFAULT_HEADERS = [
  'Sr No.','Tokan No.','Name','Post','Rank','Category','Location',
  'Date of Birth','Date of Retirement','Date of Appointment','Date of Regular',
  'Dept Qualify Examination','Date of Tradesman Mate','Date of USL','Date of SSK',
  'Date of SK','Date of HSK II','Date of HSK I','Date of MCM','Mobile No.','Email','Remark'
];

// ---------- Sheet Helpers ----------

function employeeSS_() {
  return ss_(CONFIG.employeeSheetId);
}

function employeeSheet_() {
  var sh = getSheet_(employeeSS_(), CONFIG.employee.sheetName);
  ensureHeader_(sh, EMPLOYEE_DEFAULT_HEADERS);
  return sh;
}

// ---------- Setup ----------

function employeeSetupSheets() {
  employeeSheet_();
  return 'Employee Master sheet ready';
}

// ---------- CRUD ----------

function employeeList() {
  var sheet = employeeSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) row[headers[j]] = data[i][j] || '';
    result.push(row);
  }
  return result;
}

function employeeSearch(query) {
  var all = employeeList();
  if (!query) return all.slice(0, 20);
  
  var q = String(query).toLowerCase().trim();
  var results = all.filter(function(emp) {
    return Object.values(emp).some(function(v) {
      return String(v || '').toLowerCase().indexOf(q) !== -1;
    });
  });
  return results.slice(0, 20);
}

function employeeGet(token) {
  var all = employeeList();
  var tokenKeys = ['Tokan No.', 'Token No.'];
  for (var i = 0; i < all.length; i++) {
    for (var k = 0; k < tokenKeys.length; k++) {
      if (String(all[i][tokenKeys[k]] || '').trim() === String(token).trim()) return all[i];
    }
  }
  return null;
}

function employeeSave(data) {
  data = data || {};
  var token = String(data['Tokan No.'] || data['Token No.'] || '').trim();
  if (!token) return fail_('Token No. is required');
  
  var sheet = employeeSheet_();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var tokenCol = headers.indexOf('Tokan No.');
  if (tokenCol === -1) tokenCol = headers.indexOf('Token No.');
  
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][tokenCol] || '').trim() === token) {
      headers.forEach(function(h) {
        var ci = headers.indexOf(h);
        if (data[h] !== undefined) sheet.getRange(i + 1, ci + 1).setValue(data[h]);
      });
      return { success: true, token: token, action: 'updated' };
    }
  }
  
  var row = headers.map(function(h) { return data[h] !== undefined ? data[h] : ''; });
  sheet.appendRow(row);
  return { success: true, token: token, action: 'created' };
}

function employeeDelete(token) {
  var sheet = employeeSheet_();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var tokenCol = headers.indexOf('Tokan No.');
  if (tokenCol === -1) tokenCol = headers.indexOf('Token No.');
  
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][tokenCol] || '').trim() === String(token).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

// ---------- Get Headers (for dynamic form) ----------

function employeeGetHeaders() {
  var sheet = employeeSheet_();
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(Boolean);
}