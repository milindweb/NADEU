/**
 * receipt.gs - Receipt Management module
 */

// ---------- Schema ----------
var RECEIPT_HEADERS = [
  'ID','Date','Token No.','Employee Name','Designation','Mobile No.',
  'Location','Amount','Status','Receipt No.','Remark','Created By','Created At'
];

// ---------- Sheet Helpers ----------

function receiptSS_() {
  return ss_(CONFIG.receiptSheetId);
}

function receiptSheet_() {
  var sh = getSheet_(receiptSS_(), CONFIG.receipt.sheetName);
  ensureHeader_(sh, RECEIPT_HEADERS);
  return sh;
}

// ---------- Setup ----------

function receiptSetupSheets() {
  receiptSheet_();
  return 'Receipts sheet ready';
}

// ---------- CRUD ----------

function receiptSave(data) {
  data = data || {};
  var sheet = receiptSheet_();
  var headers = RECEIPT_HEADERS;
  var token = String(data['Token No.'] || '').trim();
  var name = String(data['Employee Name'] || '').trim();
  var receiptNo = String(data['Receipt No.'] || '').trim();
  
  if (!token) return fail_('Token No. is required');
  if (!name) return fail_('Employee Name is required');
  if (!receiptNo) return fail_('Receipt No. is required');
  
  var now = nowIST_();
  var user = data._user || 'unknown';
  
  var rowData = {
    'ID': data.ID || '',
    'Date': now.split(' ')[0],
    'Token No.': token,
    'Employee Name': name,
    'Designation': data['Designation'] || '',
    'Mobile No.': data['Mobile No.'] || '',
    'Location': data['Location'] || '',
    'Amount': Number(data['Amount']) || 0,
    'Status': data['Status'] || 'Paid',
    'Receipt No.': receiptNo,
    'Remark': data['Remark'] || '',
    'Created By': user,
    'Created At': now
  };
  
  if (data.ID) {
    // Update existing
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(data.ID)) {
        headers.forEach(function(h, idx) {
          sheet.getRange(i + 1, idx + 1).setValue(rowData[h]);
        });
        return { success: true, id: data.ID, action: 'updated' };
      }
    }
  }
  
  // Create new - auto ID
  var maxId = 0;
  var allValues = sheet.getDataRange().getValues();
  for (var i = 1; i < allValues.length; i++) {
    var id = Number(allValues[i][0]);
    if (id > maxId) maxId = id;
  }
  rowData['ID'] = maxId + 1;
  
  var row = headers.map(function(h) { return rowData[h]; });
  sheet.appendRow(row);
  
  return { success: true, id: rowData['ID'], action: 'created' };
}

function receiptList() {
  var sheet = receiptSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) row[headers[j]] = data[i][j];
    result.push(row);
  }
  return result;
}

function receiptGet(id) {
  var all = receiptList();
  for (var i = 0; i < all.length; i++) {
    if (String(all[i].ID) === String(id)) return all[i];
  }
  return null;
}

function receiptDelete(id) {
  var sheet = receiptSheet_();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

function getRecentReceipts(limit) {
  limit = limit || 10;
  var all = receiptList();
  all.sort(function(a, b) {
    return new Date(b['Created At'] || 0) - new Date(a['Created At'] || 0);
  });
  return all.slice(0, limit);
}

function getReceiptsPaginated(page, pageSize, sortBy, sortDir, filters) {
  page = page || 1;
  pageSize = pageSize || 10;
  sortBy = sortBy || 'Created At';
  sortDir = sortDir || 'desc';
  
  var all = receiptList();
  
  // Apply filters
  if (filters) {
    all = all.filter(function(r) {
      for (var key in filters) {
        var f = filters[key];
        var val = String(r[key] || '').toLowerCase();
        if (f && val.indexOf(String(f).toLowerCase()) === -1) return false;
      }
      return true;
    });
  }
  
  // Sort
  all.sort(function(a, b) {
    var av = a[sortBy] || '';
    var bv = b[sortBy] || '';
    var dir = sortDir === 'asc' ? 1 : -1;
    if (!isNaN(av) && !isNaN(bv)) return (Number(av) - Number(bv)) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  
  var total = all.length;
  var totalPages = Math.ceil(total / pageSize);
  var start = (page - 1) * pageSize;
  var data = all.slice(start, start + pageSize);
  
  return {
    data: data,
    pagination: {
      page: page,
      pageSize: pageSize,
      total: total,
      totalPages: totalPages
    }
  };
}