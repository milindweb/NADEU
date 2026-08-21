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
          '<a href="index.html" class="header-logo">' +
            '<img src="/img/logo-192.png" alt="NAD Employees Union" width="36" height="36">' +
            '<span class="header-title">NAD Employees Union</span>' +
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
        '<div class="header-tagline">Unity · Solidarity · Strength</div>' +
        '<div class="header-registration">Regd by Ministry of Defence, Govt. of India</div>' +
      '</header>';
  }

  if (footer) {
    footer.innerHTML =
      '<footer class="site-footer">' +
        '<div class="footer-inner">' +
          '<p class="footer-founder">Founder – Mayur Kamal Vitthal Mhatre</p>' +
          '<p class="footer-copy">&copy; ' + new Date().getFullYear() + ' NAD Employees Union. All rights reserved.</p>' +
        '</div>' +
      '</footer>';
  }
})();
