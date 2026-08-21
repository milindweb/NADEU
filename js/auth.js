/**
 * auth.js - Authentication handler
 * One-click login with localStorage, module guard
 */

// Theme management
const Theme = {
  init() {
    const saved = localStorage.getItem('nadeu_theme') || 'light';
    this.apply(saved);
    this.bindToggle();
  },
  
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nadeu_theme', theme);
    this.updateIcon(theme);
  },
  
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
  },
  
  updateIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  },
  
  bindToggle() {
    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggle());
  }
};

const Auth = {
  token: null,
  user: null,
  remember: false,
  
  init() {
    Theme.init();
    this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    this.remember = localStorage.getItem(CONFIG.STORAGE_KEYS.REMEMBER) === 'true';
    
    if (this.token) {
      const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
      if (userStr) this.user = JSON.parse(userStr);
    }
    
    this.bindEvents();
    return this.checkSession();
  },
  
  bindEvents() {
    document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleAuthForm('register');
    });
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleAuthForm('login');
    });
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    document.getElementById('changePwdBtn')?.addEventListener('click', () => this.showChangePasswordModal());
    document.getElementById('rememberMe')?.addEventListener('change', (e) => {
      this.remember = e.target.checked;
      localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER, this.remember);
    });
    document.getElementById('forgotPwd')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });
  },

  toggleAuthForm(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginSwitch = document.querySelector('.auth-switch:not(#registerSwitch)');
    const registerSwitch = document.getElementById('registerSwitch');
    
    if (mode === 'register') {
      loginForm?.classList.add('hidden');
      registerForm?.classList.remove('hidden');
      loginSwitch?.classList.add('hidden');
      registerSwitch?.classList.remove('hidden');
      document.getElementById('regUsername')?.focus();
    } else {
      loginForm?.classList.remove('hidden');
      registerForm?.classList.add('hidden');
      loginSwitch?.classList.remove('hidden');
      registerSwitch?.classList.add('hidden');
      document.getElementById('username')?.focus();
    }
  },

  async register(username, password, name, email, mobile) {
    const res = await API.register({ username, password, name, email, mobile });
    return res;
  },

  async handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const mobile = form.mobile.value.trim();
    const password = form.password.value;
    const confirm = form.confirm.value;
    
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRe = /^[6-9]\d{9}$/;
    
    if (username.length < 3) {
      this.showError(form, 'Username must be at least 3 characters');
      return;
    }
    if (!name) {
      this.showError(form, 'Please enter your full name');
      return;
    }
    if (!emailRe.test(email)) {
      this.showError(form, 'Please enter a valid email address');
      return;
    }
    if (!mobileRe.test(mobile)) {
      this.showError(form, 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 4) {
      this.showError(form, 'Password must be at least 4 characters');
      return;
    }
    if (password !== confirm) {
      this.showError(form, 'Passwords do not match');
      return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Registering...';
    
    try {
      const res = await this.register(username, password, name, email, mobile);
      this.showToast(res.message || 'Registered successfully! Contact admin for module access.');
      this.toggleAuthForm('login');
      form.reset();
    } catch (err) {
      this.showError(form, err.message || 'Registration failed');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },

  handleForgotPassword() {
    this.showForgotPasswordModal();
  },

  showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Forgot Password</h3>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Enter your username or registered email to request a password reset.</p>
          <form id="forgotPwdForm">
            <div class="field">
              <label for="fpIdentifier">Username or Email</label>
              <input type="text" id="fpIdentifier" name="identifier" autocomplete="username" required placeholder="Enter username or email">
            </div>
            <div class="error-msg hidden"></div>
            <div class="btn-group">
              <button type="submit" class="btn-primary">Request Reset</button>
              <button type="button" class="btn-secondary modal-close">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Focus input
    setTimeout(() => modal.querySelector('#fpIdentifier')?.focus(), 100);
    
    // Close handlers
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Form submit
    modal.querySelector('#forgotPwdForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleForgotPasswordSubmit(e.target, modal);
    });
  },

  async handleForgotPasswordSubmit(form, modal) {
    const identifier = form.identifier.value.trim();
    if (!identifier) return;
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    try {
      const res = await API.forgotPassword(identifier);
      this.showToast(res.message || 'Reset request sent');
      modal.remove();
    } catch (err) {
      this.showError(form, err.message || 'Request failed');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },
  
  async checkSession() {
    if (!this.token) return false;
    
    try {
      const res = await API.currentUser(this.token);
      this.user = res.user;
      if (this.user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.user));
        this.onAuthSuccess();
        return true;
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
    }
    
    this.clearSession();
    return false;
  },
  
  async register(username, password, name, email, mobile) {
    const res = await API.register({ username, password, name, email, mobile });
    return res;
  },

  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    const remember = form.rememberMe?.checked || false;
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    
    try {
      const res = await API.login(username, password, remember);
      this.token = res.user.token;
      this.user = res.user;
      this.remember = remember;
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, this.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.user));
      localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER, this.remember);
      
      this.onAuthSuccess();
      this.showToast('Welcome, ' + (this.user.name || this.user.username));
    } catch (err) {
      this.showError(form, err.message || 'Login failed');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },
  
  async logout() {
    try {
      if (this.token) await API.logout(this.token);
    } catch (err) {
      console.warn('Logout error:', err);
    }
    this.clearSession();
    this.showLoginScreen();
  },
  
  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    if (!this.remember) localStorage.removeItem(CONFIG.STORAGE_KEYS.REMEMBER);
  },
  
  onAuthSuccess() {
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    this.updateUserUI();
    document.dispatchEvent(new CustomEvent('auth:success', { detail: this.user }));
  },
  
  showLoginScreen() {
    document.getElementById('loginScreen')?.classList.remove('hidden');
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('loginForm')?.reset();
  },
  
  updateUserUI() {
    const el = document.getElementById('currentUser');
    if (el && this.user) {
      el.textContent = this.user.name || this.user.username;
    }
  },
  
  hasModule(module) {
    if (!this.user) return false;
    if (this.user.role === 'admin') return true;
    return this.user.modules?.includes(module) === true;
  },
  
  requireModule(module) {
    if (!this.hasModule(module)) {
      this.showToast('Access denied: ' + module + ' module required', 'error');
      return false;
    }
    return true;
  },

  showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="changePwdForm">
            <div class="field">
              <label for="cpCurrent">Current Password</label>
              <input type="password" id="cpCurrent" name="currentPassword" autocomplete="current-password" required>
            </div>
            <div class="field">
              <label for="cpNew">New Password</label>
              <input type="password" id="cpNew" name="newPassword" autocomplete="new-password" required minlength="4">
            </div>
            <div class="field">
              <label for="cpConfirm">Confirm New Password</label>
              <input type="password" id="cpConfirm" name="confirmPassword" autocomplete="new-password" required minlength="4">
            </div>
            <div class="error-msg hidden"></div>
            <div class="btn-group">
              <button type="submit" class="btn-primary">Change Password</button>
              <button type="button" class="btn-secondary modal-close">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.querySelector('#cpCurrent')?.focus(), 100);
    
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    modal.querySelector('#changePwdForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleChangePasswordSubmit(e.target, modal);
    });
  },

  async handleChangePasswordSubmit(form, modal) {
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      this.showError(form, 'New passwords do not match');
      return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Changing...';
    
    try {
      await API.changePassword(this.token, currentPassword, newPassword, confirmPassword);
      this.showToast('Password changed successfully');
      modal.remove();
    } catch (err) {
      this.showError(form, err.message || 'Failed to change password');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },

  showError(form, msg) {
    let errEl = form.querySelector('.error-msg');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'error-msg';
      form.insertBefore(errEl, form.querySelector('button'));
    }
    errEl.textContent = msg;
    errEl.style.display = 'block';
  },
  
  showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => Auth.init());