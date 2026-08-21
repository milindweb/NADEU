/**
 * auth.js - Authentication handler for index.html (app page)
 * Handles session validation, logout, and user UI updates.
 * Login and registration are handled on separate pages.
 */

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
      btn.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
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

  init() {
    Theme.init();
    this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);

    if (this.token) {
      const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
      if (userStr) {
        try { this.user = JSON.parse(userStr); } catch (e) { this.user = null; }
      }
    }

    this.bindEvents();
    this.updateUserUI();
    this.checkSession();
  },

  bindEvents() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    document.getElementById('changePwdBtn')?.addEventListener('click', () => this.showChangePasswordModal());
  },

  async checkSession() {
    if (!this.token) {
      this.redirectToLogin();
      return false;
    }

    try {
      const res = await API.currentUser(this.token);
      if (!res.user) throw new Error('User not found');
      this.user = res.user;
      if (this.user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.user));
        this.updateUserUI();
        return true;
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
    }

    this.clearSession();
    this.redirectToLogin();
    return false;
  },

  async logout() {
    try {
      if (this.token) await API.logout(this.token);
    } catch (err) {
      console.warn('Logout error:', err);
    }
    this.clearSession();
    this.redirectToLogin();
  },

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REMEMBER);
  },

  redirectToLogin() {
    window.location.href = 'login.html';
  },

  updateUserUI() {
    const el = document.getElementById('currentUser');
    if (el && this.user) {
      el.textContent = this.user.name || this.user.username;
    }
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
    errEl.classList.remove('hidden');
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

document.addEventListener('DOMContentLoaded', () => Auth.init());
