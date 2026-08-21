/**
 * login.js - Login page handler
 */
document.addEventListener('DOMContentLoaded', function () {
  var token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  if (token) {
    window.location.href = 'index.html';
    return;
  }

  var form = document.getElementById('loginForm');
  var btn = document.getElementById('loginBtn');
  var msg = document.getElementById('authMsg');
  var pwInput = document.getElementById('password');
  var pwToggle = document.getElementById('pwToggle');

  pwToggle.addEventListener('click', function () {
    var show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? '\u{1F441}' : '\u{1F441}';
  });

  document.getElementById('forgotPwd').addEventListener('click', function (e) {
    e.preventDefault();
    var id = prompt('Enter your username or email for password reset:');
    if (!id) return;
    msg.className = 'auth-msg';
    msg.textContent = 'Sending request...';
    API.forgotPassword(id).then(function (res) {
      msg.className = 'auth-msg success';
      msg.textContent = res.message || 'Reset request sent.';
    }).catch(function (err) {
      msg.className = 'auth-msg error';
      msg.textContent = err.message || 'Request failed.';
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    var remember = document.getElementById('rememberMe').checked;

    if (!username || !password) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Please enter username and password.';
      return;
    }

    msg.className = 'auth-msg';
    msg.textContent = 'Signing in...';
    btn.disabled = true;

    API.login(username, password, remember).then(function (res) {
      if (!res.user) throw new Error('Login failed: no user data returned.');
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, res.user.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(res.user));
      localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER, remember);
      window.location.href = 'index.html';
    }).catch(function (err) {
      msg.className = 'auth-msg error';
      msg.textContent = err.message || 'Login failed. Try again.';
      btn.disabled = false;
    });
  });
});
