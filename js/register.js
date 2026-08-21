/**
 * register.js - Registration page handler
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('registerForm');
  var btn = document.getElementById('registerBtn');
  var msg = document.getElementById('authMsg');

  function setupPwToggle(toggleId, inputId) {
    var toggle = document.getElementById(toggleId);
    var input = document.getElementById(inputId);
    if (toggle && input) {
      toggle.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.textContent = show ? '\u{1F441}' : '\u{1F441}';
      });
    }
  }
  setupPwToggle('pwToggle1', 'regPassword');
  setupPwToggle('pwToggle2', 'regConfirm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var username = document.getElementById('regUsername').value.trim();
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var mobile = document.getElementById('regMobile').value.trim();
    var password = document.getElementById('regPassword').value;
    var confirm = document.getElementById('regConfirm').value;

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var mobileRe = /^[6-9]\d{9}$/;

    if (username.length < 3) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Username must be at least 3 characters.';
      return;
    }
    if (!name) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Please enter your full name.';
      return;
    }
    if (!emailRe.test(email)) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Please enter a valid email address.';
      return;
    }
    if (!mobileRe.test(mobile)) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    if (password.length < 4) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Password must be at least 4 characters.';
      return;
    }
    if (password !== confirm) {
      msg.className = 'auth-msg error';
      msg.textContent = 'Passwords do not match.';
      return;
    }

    msg.className = 'auth-msg';
    msg.textContent = 'Registering...';
    btn.disabled = true;

    API.register({ username: username, password: password, name: name, email: email, mobile: mobile }).then(function (res) {
      msg.className = 'auth-msg success';
      msg.textContent = res.message || 'Registered successfully! Redirecting to login...';
      setTimeout(function () { window.location.href = 'login.html'; }, 1500);
    }).catch(function (err) {
      msg.className = 'auth-msg error';
      msg.textContent = err.message || 'Registration failed. Try again.';
      btn.disabled = false;
    });
  });
});
