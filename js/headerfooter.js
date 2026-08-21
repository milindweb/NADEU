/**
 * headerfooter.js - Reusable Site Header & Footer Component
 *
 * Usage:
 *   <div id="header"></div>   → SiteHeader renders into this
 *   <div id="footer"></div>   → SiteFooter renders into this
 *   <script src="js/headerfooter.js"></script>
 *
 * API:
 *   SiteHeader.render(container)  - inject header HTML
 *   SiteFooter.render(container)  - inject footer HTML
 *   SiteHeader.inject()           - auto-find #header and render
 *   SiteFooter.inject()           - auto-find #footer and render
 *   SiteHeader.updateUser()       - refresh user badge after login/logout
 */
const SiteHeader = {
  render(container) {
    if (!container) return;
    const isLoggedIn = !!localStorage.getItem('nadeu_token');
    const username = localStorage.getItem('nadeu_username') || 'User';
    
    container.innerHTML =
      '<header class="site-header app-header">' +
        '<div class="header-left">' +
          '<a href="index.html" class="header-logo" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:10px">' +
            '<img src="img/logo-192.png" alt="NAD Employees Union" width="32" height="32" style="border-radius:50%">' +
            '<h1>NAD Employees Union</h1>' +
          '</a>' +
        '</div>' +
        '<div class="header-right">' +
          (isLoggedIn
            ? '<span id="currentUser" class="user-badge">' + username + '</span>' +
              '<button id="changePwdBtn" class="icon-btn" title="Change Password" aria-label="Change password">&#128273;</button>' +
              '<button id="themeToggle" class="icon-btn" title="Toggle theme" aria-label="Toggle dark mode">&#127769;</button>' +
              '<button id="logoutBtn" class="icon-btn" title="Logout">&#9211;</button>'
            : '<a href="login.html" class="header-btn">Login</a>') +
        '</div>' +
      '</header>';
    
    this.bindEvents(container);
  },

  bindEvents(container) {
    const logoutBtn = container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    const themeToggle = container.querySelector('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.handleThemeToggle());
    }

    const changePwdBtn = container.querySelector('#changePwdBtn');
    if (changePwdBtn) {
      changePwdBtn.addEventListener('click', () => {
        if (typeof Auth !== 'undefined' && Auth.showChangePasswordModal) {
          Auth.showChangePasswordModal();
        }
      });
    }
  },

  handleLogout() {
    localStorage.removeItem('nadeu_token');
    localStorage.removeItem('nadeu_username');
    localStorage.removeItem('nadeu_remember');
    localStorage.removeItem('nadeu_form_data');
    localStorage.removeItem('nadeu_employees_cache');
    localStorage.removeItem('nadeu_employees_cache_time');
    window.location.href = 'login.html';
  },

  handleThemeToggle() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('nadeu_theme', isDark ? 'light' : 'dark');
  },

  updateUser() {
    const badge = document.getElementById('currentUser');
    if (badge) {
      const username = localStorage.getItem('nadeu_username') || 'User';
      badge.textContent = username;
    }
    this.render(document.getElementById('header'));
  },

  inject() {
    this.render(document.getElementById('header'));
  }
};

const SiteFooter = {
  render(container) {
    if (!container) return;
    container.innerHTML =
      '<footer class="site-footer">' +
        '<div class="footer-inner">' +
          '<p class="footer-founder">Founder – Mayur Kamal Vitthal Mhatre</p>' +
          '<p class="footer-copy">&copy; ' + new Date().getFullYear() + ' NAD Employees Union. All rights reserved.</p>' +
        '</div>' +
      '</footer>';
  },

  inject() {
    this.render(document.getElementById('footer'));
  }
};

// Auto-inject on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  SiteHeader.inject();
  SiteFooter.inject();
});
