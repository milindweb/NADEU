/**
 * auth.gs - Authentication module for NAD Employees Union
 * New auth spreadsheet with module-based permissions
 */

// ---------- Sheet Helpers ----------

function authSS_() {
  return ss_(CONFIG.authSheetId);
}

function usersSheet_() {
  var sh = getSheet_(authSS_(), CONFIG.auth.usersSheet);
  ensureHeader_(sh, ['username', 'password', 'role', 'modules', 'name', 'email', 'mobile', 'createdAt']);
  return sh;
}

function sessionsSheet_() {
  var sh = getSheet_(authSS_(), CONFIG.auth.sessionsSheet);
  ensureHeader_(sh, ['token', 'username', 'role', 'modules', 'created']);
  return sh;
}

function findUser_(username) {
  var rows = rowsToObjects_(usersSheet_());
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].username).toLowerCase() === String(username).toLowerCase()) return rows[i];
  }
  return null;
}

// ---------- Setup ----------

function authSetupSheets() {
  usersSheet_();
  sessionsSheet_();
  
  // Create default admin if not exists
  var admin = findUser_(CONFIG.defaultAdmin.username);
  if (!admin) {
    usersSheet_().appendRow([
      CONFIG.defaultAdmin.username,
      CONFIG.defaultAdmin.password,
      'admin',
      CONFIG.modules.RECEIPT,
      CONFIG.defaultAdmin.name,
      CONFIG.defaultAdmin.email,
      CONFIG.defaultAdmin.mobile,
      nowIST_()
    ]);
  }
  return 'Auth sheets ready';
}

// ---------- Login / Register / Logout ----------

function authLogin_(body) {
  var username = String(body.username || '').trim();
  var password = String(body.password || '');
  var remember = body.remember === true;
  
  if (!username || !password) return fail_('Username and password are required');
  
  var user = findUser_(username);
  if (!user || String(user.password) !== password) return fail_('Invalid username or password', 401);
  
  var token = Utilities.getUuid();
  sessionsSheet_().appendRow([token, user.username, user.role || 'user', user.modules || '', nowIST_()]);
  
  var userData = publicUser_(user);
  userData.token = token;
  userData.remember = remember;
  
  return json_({ ok: true, user: userData });
}

function authRegister_(body) {
  var username = String(body.username || '').trim();
  var password = String(body.password || '');
  var name = String(body.name || '').trim();
  var email = String(body.email || '').trim().toLowerCase();
  var mobile = String(body.mobile || '').trim();
  
  if (username.length < 3) return fail_('Username must be at least 3 characters');
  if (password.length < 4) return fail_('Password must be at least 4 characters');
  if (!name) return fail_('Name is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail_('Enter a valid email address');
  if (!/^[6-9]\d{9}$/.test(mobile)) return fail_('Enter a valid 10-digit mobile number');
  if (findUser_(username)) return fail_('Username already exists');
  
  var rows = rowsToObjects_(usersSheet_());
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].email && String(rows[i].email).toLowerCase() === email) return fail_('Email already registered');
    if (rows[i].mobile && String(rows[i].mobile) === mobile) return fail_('Mobile number already registered');
  }
  
  // New users get role=user and NO module access by default (admin must grant)
  usersSheet_().appendRow([username, password, 'user', '', name, email, mobile, nowIST_()]);
  
  return json_({ ok: true, message: 'Registered successfully. Contact admin to grant module access.' });
}

function authLogout_(body) {
  var token = String(body.token || '');
  var sh = sessionsSheet_();
  var rows = rowsToObjects_(sh);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].token) === token) { sh.deleteRow(rows[i]._row); break; }
  }
  return json_({ ok: true });
}

// ---------- Forgot Password ----------

function authForgotPassword_(body) {
  var identifier = String(body.identifier || '').trim().toLowerCase();
  
  if (!identifier) return fail_('Username or email is required');
  
  var rows = rowsToObjects_(usersSheet_());
  var user = null;
  for (var i = 0; i < rows.length; i++) {
    var u = rows[i];
    if (String(u.username).toLowerCase() === identifier || (u.email && String(u.email).toLowerCase() === identifier)) {
      user = u;
      break;
    }
  }
  
  if (!user) {
    // Don't reveal if user exists - security
    return json_({ ok: true, message: 'If the account exists, reset instructions have been sent. Contact NAD Employees Union President or Secretary for assistance.' });
  }
  
  // Generate temporary password
  var tempPwd = 'Temp' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
  var sh = usersSheet_();
  sh.getRange(user._row, 2).setValue(tempPwd); // password column
  
  // Log the reset request (optional - could add audit sheet)
  log_('Password reset requested for: ' + user.username + ' - Temp password generated');
  
  return json_({ ok: true, message: 'Temporary password generated. Contact NAD Employees Union President or Secretary to receive your temporary password.' });
}

// ---------- Session Verification ----------

function verifyToken_(token) {
  if (!token) return null;
  var rows = rowsToObjects_(sessionsSheet_());
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].token) === String(token)) return rows[i];
  }
  return null;
}

function publicUser_(user) {
  return {
    username: user.username,
    role: user.role || 'user',
    modules: String(user.modules || '').split(',').map(function(m) { return String(m).trim(); }).filter(Boolean),
    name: user.name || '',
    email: user.email || '',
    mobile: user.mobile || ''
  };
}

function authCheck_(body) {
  var sess = verifyToken_(body.token);
  if (!sess) return fail_('Session expired. Please log in again.', 401);
  var user = findUser_(sess.username);
  if (!user) return fail_('User not found', 401);
  return json_({ ok: true, user: publicUser_(user) });
}

function currentUserFromToken_(body) {
  var sess = verifyToken_(body.token);
  if (!sess) return json_({ ok: true, user: null });
  var user = findUser_(sess.username);
  return json_({ ok: true, user: user ? publicUser_(user) : null });
}

/**
 * Module access guard
 * admin → everything
 * user → module listed in modules column
 */
function requireModule_(token, module) {
  var sess = verifyToken_(token);
  if (!sess) return { ok: false, error: 'Login required', code: 401 };
  var user = findUser_(sess.username);
  if (!user) return { ok: false, error: 'User not found', code: 401 };
  
  var role = String(user.role || '').toLowerCase();
  if (role === 'admin') return null;
  
  var mods = String(user.modules || '').split(',').map(function (m) { return String(m).trim().toLowerCase(); });
  if (mods.indexOf(String(module).toLowerCase()) !== -1) return null;
  
  return { ok: false, error: 'You do not have access to this module', code: 403 };
}

// ---------- Admin Functions ----------

function authListUsers() {
  return rowsToObjects_(usersSheet_()).map(function(u) { return publicUser_(u); });
}

function authUpdateUser(body) {
  var username = String(body.username || '').trim();
  var user = findUser_(username);
  if (!user) return fail_('User not found');
  
  var sh = usersSheet_();
  var row = user._row;
  var updates = {};
  
  if (body.password) updates.password = body.password;
  if (body.role) updates.role = body.role;
  if (body.modules !== undefined) updates.modules = Array.isArray(body.modules) ? body.modules.join(',') : body.modules;
  if (body.name) updates.name = body.name;
  if (body.email) updates.email = body.email;
  if (body.mobile) updates.mobile = body.mobile;
  
  var headers = ['username', 'password', 'role', 'modules', 'name', 'email', 'mobile', 'createdAt'];
  Object.keys(updates).forEach(function(key) {
    var col = headers.indexOf(key) + 1;
    if (col > 0) sh.getRange(row, col).setValue(updates[key]);
  });
  
  return json_({ ok: true, user: publicUser_(findUser_(username)) });
}

function authDeleteUser(body) {
  var username = String(body.username || '').trim();
  if (username === 'admin') return fail_('Cannot delete admin user');
  var user = findUser_(username);
  if (!user) return fail_('User not found');
  usersSheet_().deleteRow(user._row);
  return json_({ ok: true });
}

// ---------- Forgot Password (public) ----------

function authForgotPassword_(body) {
  var identifier = String(body.identifier || '').trim().toLowerCase();
  
  if (!identifier) return fail_('Username or email is required');
  
  var rows = rowsToObjects_(usersSheet_());
  var user = null;
  for (var i = 0; i < rows.length; i++) {
    var u = rows[i];
    if (String(u.username).toLowerCase() === identifier || (u.email && String(u.email).toLowerCase() === identifier)) {
      user = u;
      break;
    }
  }
  
  if (!user) {
    // Don't reveal if user exists
    return json_({ ok: true, message: 'If the account exists, a temporary password has been generated. Contact NAD Employees Union President or Secretary to receive it.' });
  }
  
  // Generate temporary password
  var tempPwd = 'Temp' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
  var sh = usersSheet_();
  sh.getRange(user._row, 2).setValue(tempPwd); // password column
  
  log_('Password reset requested for: ' + user.username + ' - Temp password generated');
  
  return json_({ ok: true, message: 'Temporary password generated. Contact NAD Employees Union President or Secretary to receive your temporary password.' });
}

// ---------- Change Password (authenticated user) ----------

function authChangePassword_(body, token) {
  var sess = verifyToken_(token);
  if (!sess) return fail_('Session expired. Please log in again.', 401);
  var user = findUser_(sess.username);
  if (!user) return fail_('User not found', 401);
  
  var currentPassword = String(body.currentPassword || '');
  var newPassword = String(body.newPassword || '');
  var confirmPassword = String(body.confirmPassword || '');
  
  if (!currentPassword || !newPassword || !confirmPassword) return fail_('All fields are required');
  if (newPassword.length < 4) return fail_('New password must be at least 4 characters');
  if (newPassword !== confirmPassword) return fail_('New passwords do not match');
  if (String(user.password) !== currentPassword) return fail_('Current password is incorrect');
  if (String(user.password) === newPassword) return fail_('New password must be different from current password');
  
  var sh = usersSheet_();
  sh.getRange(user._row, 2).setValue(newPassword); // password column
  
  log_('Password changed for: ' + user.username);
  
  return json_({ ok: true, message: 'Password changed successfully.' });
}