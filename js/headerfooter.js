/**
 * headerfooter.js - Reusable Site Header & Footer Component
 *
 * Usage:
 *   <div id="header"></div>   -> SiteHeader renders into this
 *   <div id="footer"></div>   -> SiteFooter renders into this
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
  isPortal() {
    return document.body && document.body.dataset.page === 'portal';
  },

  render(container) {
    if (!container) return;

    if (this.isPortal()) {
      this.renderPublic(container);
    } else {
      this.renderApp(container);
    }

    this.bindEvents(container);
  },

  renderPublic(container) {
    container.innerHTML =
      '<header class="site-header portal-header">' +
        '<div class="header-inner">' +
          '<div class="header-left">' +
            '<a href="index.html" class="header-logo">' +
              '<img src="img/logo-192.png" alt="NAD Employees Union" width="32" height="32">' +
              '<div class="header-title-wrap">' +
                '<span class="header-title">NAD Employees Union</span>' +
                '<span class="header-subtitle">Unity &bull; Solidarity &bull; Strength</span>' +
              '</div>' +
            '</a>' +
          '</div>' +
          '<button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle navigation">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
          '<nav class="header-nav" id="headerNav">' +
            '<a href="#about">About</a>' +
            '<a href="#bearers">Bearers</a>' +
            '<a href="#contact">Contact</a>' +
            '<a href="login.html" class="header-btn">Member Login</a>' +
          '</nav>' +
        '</div>' +
      '</header>';
  },

  renderApp(container) {
    var isLoggedIn = !!localStorage.getItem('nadeu_token');
    var username = localStorage.getItem('nadeu_username') || 'User';

    container.innerHTML =
      '<header class="site-header app-header">' +
        '<div class="header-left">' +
          '<a href="index.html" class="header-logo">' +
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
  },

  bindEvents(container) {
    var logoutBtn = container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() { SiteHeader.handleLogout(); });
    }

    var themeToggle = container.querySelector('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function() { SiteHeader.handleThemeToggle(); });
    }

    var changePwdBtn = container.querySelector('#changePwdBtn');
    if (changePwdBtn) {
      changePwdBtn.addEventListener('click', function() {
        if (typeof Auth !== 'undefined' && Auth.showChangePasswordModal) {
          Auth.showChangePasswordModal();
        }
      });
    }

    // Mobile menu toggle
    var menuToggle = container.querySelector('#mobileMenuToggle');
    var nav = container.querySelector('#headerNav');
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
        nav.classList.toggle('open');
        menuToggle.classList.toggle('active');
      });
      // Close menu on nav link click
      nav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          nav.classList.remove('open');
          menuToggle.classList.remove('active');
        });
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
    var html = document.documentElement;
    var isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('nadeu_theme', isDark ? 'light' : 'dark');
  },

  updateUser() {
    var badge = document.getElementById('currentUser');
    if (badge) {
      var username = localStorage.getItem('nadeu_username') || 'User';
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
          '<p class="footer-founder">Founder &ndash; Mayur Kamal Vitthal Mhatre</p>' +
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
