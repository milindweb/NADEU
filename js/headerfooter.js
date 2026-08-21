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
 */
const SiteHeader = {
  render(container) {
    if (!container) return;
    const isLoggedIn = !!localStorage.getItem('nadeu_token');
    container.innerHTML =
      '<header class="site-header">' +
        '<div class="header-inner">' +
          '<a href="index.html" class="header-logo">' +
            '<img src="img/logo-192.png" alt="NAD Employees Union" width="36" height="36">' +
            '<div class="header-title-wrap">' +
              '<span class="header-title">NAD Employees Union</span>' +
              '<span class="header-subtitle">Regd by Ministry of Defence, Govt. of India</span>' +
            '</div>' +
          '</a>' +
          '<div class="header-actions">' +
            (isLoggedIn
              ? '<a href="index.html" class="header-btn">App</a>'
              : '<a href="login.html" class="header-btn">Login</a>') +
          '</div>' +
        '</div>' +
      '</header>';
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
