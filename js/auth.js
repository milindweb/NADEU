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
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    document.getElementById('rememberMe')?.addEventListener('change', (e) => {
      this.remember = e.target.checked;
      localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER, this.remember);
    });
    document.getElementById('forgotPwd')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });
  },

  handleForgotPassword() {
    this.showToast('Contact NAD Employees Union President or Secretary for password reset', 'error');
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