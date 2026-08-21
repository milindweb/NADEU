/**
 * headerfooter.js - Injects shared header and footer
 */
(function () {
  var header = document.getElementById('header');
  var footer = document.getElementById('footer');

  if (header) {
    header.innerHTML =
      '<header class="site-header">' +
        '<div class="header-inner">' +
          '<a href="/" class="header-logo">' +
            '<svg viewBox="0 0 32 32" fill="none" width="28" height="28"><circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2"/><text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">NAD</text></svg>' +
            '<span>NAD Employees Union</span>' +
          '</a>' +
          '<nav class="header-nav">' +
            '<a href="/">Home</a>' +
            '<a href="/about.html">About</a>' +
          '</nav>' +
          '<div class="header-actions">' +
            (localStorage.getItem('nadeu_token')
              ? '<a href="/" class="header-btn">App</a>'
              : '<a href="/login.html" class="header-btn">Login</a>') +
          '</div>' +
        '</div>' +
      '</header>';
  }

  if (footer) {
    footer.innerHTML =
      '<footer class="site-footer">' +
        '<div class="footer-inner">' +
          '<p>&copy; ' + new Date().getFullYear() + ' NAD Employees Union. All rights reserved.</p>' +
        '</div>' +
      '</footer>';
  }
})();
