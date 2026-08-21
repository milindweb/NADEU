/**
 * contact-form.js - Handles contact form (placeholder)
 */
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('cfMsg');
    var btn = document.getElementById('cfBtn');
    msg.className = 'auth-msg';
    msg.textContent = 'Thank you! Your message has been received.';
    msg.classList.add('ok');
    btn.disabled = true;
    form.reset();
    setTimeout(function () { btn.disabled = false; }, 3000);
  });
})();
