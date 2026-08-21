/**
 * api.gs - Main router for Google Apps Script web app
 * Handles all module endpoints with auth guard
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return fail_('No request data');
    }
    var body = JSON.parse(e.postData.contents);
    var fn = String(body.fn || '');
    var args = body.args || [];
    var token = body.token || '';
    
    // Public endpoints (no auth required)
    var publicEndpoints = ['login', 'register', 'forgotPassword', 'check', 'currentUser'];
    if (publicEndpoints.indexOf(fn) !== -1) {
      return routePublic(fn, args, body);
    }
    
    // Protected endpoints - verify token
    var sess = verifyToken_(token);
    if (!sess) return fail_('Session expired. Please log in again.', 401);
    
    var user = findUser_(sess.username);
    if (!user) return fail_('User not found', 401);
    
    // Admin has full access
    var role = String(user.role || '').toLowerCase();
    var isAdmin = role === 'admin';
    
    // Module access check for non-admin
    var moduleMap = {
      // Employee
      'syncEmployees': CONFIG.modules.RECEIPT,
      'getEmployees': CONFIG.modules.RECEIPT,
      'searchEmployees': CONFIG.modules.RECEIPT,
      'getEmployee': CONFIG.modules.RECEIPT,
      'saveEmployee': CONFIG.modules.RECEIPT,
      'deleteEmployee': CONFIG.modules.RECEIPT,
      'employeeGetHeaders': CONFIG.modules.RECEIPT,
      // Receipt
      'saveReceipt': CONFIG.modules.RECEIPT,
      'getReceipts': CONFIG.modules.RECEIPT,
      'getReceipt': CONFIG.modules.RECEIPT,
      'deleteReceipt': CONFIG.modules.RECEIPT,
      'getRecentReceipts': CONFIG.modules.RECEIPT,
      'getReceiptsPaginated': CONFIG.modules.RECEIPT,
      // Admin
      'authListUsers': CONFIG.modules.RECEIPT,
      'authUpdateUser': CONFIG.modules.RECEIPT,
      'authDeleteUser': CONFIG.modules.RECEIPT,
      // Auth (self-service)
      'changePassword': CONFIG.modules.RECEIPT
    };
    
    var requiredModule = moduleMap[fn];
    if (requiredModule && !isAdmin) {
      var mods = String(user.modules || '').split(',').map(function(m) { return m.trim().toLowerCase(); });
      if (mods.indexOf(requiredModule.toLowerCase()) === -1) {
        return fail_('Access denied: ' + requiredModule + ' module required', 403);
      }
    }
    
    return routeProtected(fn, args, body, user);
  } catch (err) {
    log_(err.message || err);
    return fail_(err.message || 'Server error');
  }
}

function routePublic(fn, args, body) {
  var map = {
    'login': authLogin_,
    'register': authRegister_,
    'forgotPassword': authForgotPassword_,
    'check': authCheck_,
    'currentUser': currentUserFromToken_
  };
  var handler = map[fn];
  if (!handler) return fail_('Unknown endpoint: ' + fn);
  return handler.apply(null, [body].concat(args));
}

function routeProtected(fn, args, body, user) {
  body = body || {};
  body._user = user.username;
  
  var map = {
    // Auth
    'logout': authLogout_,
    'changePassword': authChangePassword_,
    'authListUsers': authListUsers,
    'authUpdateUser': authUpdateUser,
    'authDeleteUser': authDeleteUser,
    // Employee
    'syncEmployees': employeeSyncFromSeniority,
    'getEmployees': employeeList,
    'searchEmployees': employeeSearch,
    'getEmployee': employeeGet,
    'saveEmployee': employeeSave,
    'deleteEmployee': employeeDelete,
    'employeeGetHeaders': employeeGetHeaders,
    // Receipt
    'saveReceipt': receiptSave,
    'getReceipts': receiptList,
    'getReceipt': receiptGet,
    'deleteReceipt': receiptDelete,
    'getRecentReceipts': getRecentReceipts,
    'getReceiptsPaginated': getReceiptsPaginated,
    // Setup
    'setupAll': function() {
      authSetupSheets();
      employeeSetupSheets();
      receiptSetupSheets();
      return 'All sheets ready';
    }
  };
  
  var handler = map[fn];
  if (!handler) return fail_('Unknown endpoint: ' + fn);
  
  try {
    var result = handler.apply(null, [body].concat(args));
    return typeof result === 'string' ? result : json_({ ok: true, data: result });
  } catch (err) {
    log_(err.message || err);
    return fail_(err.message || 'Operation failed');
  }
}

function doGet(e) {
  var params = e.parameter || {};
  var fn = params.fn || '';

  if (fn === 'setupAll') {
    authSetupSheets();
    employeeSetupSheets();
    receiptSetupSheets();
    return ContentService.createTextOutput('Setup complete')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService.createTextOutput('NAD Employees Union API - POST only')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ===== Include other modules =====
// @include "config.gs"
// @include "auth.gs"
// @include "employee.gs"
// @include "receipt.gs"