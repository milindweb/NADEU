/**
 * seo-injector.js - Injects SEO meta tags from PAGE_CONFIG
 */
(function () {
  var cfg = window.PAGE_CONFIG;
  if (!cfg) return;

  if (cfg.title) document.title = cfg.title + ' | NAD Employees Union';

  function setMeta(name, content, attr) {
    var el = document.querySelector('meta[' + (attr || 'name') + '="' + name + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr || 'name', name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  }

  if (cfg.description) setMeta('description', cfg.description);
  if (cfg.canonical) {
    var link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = window.location.origin + cfg.canonical;
  }

  setMeta('og:title', cfg.title || document.title, 'property');
  setMeta('og:description', cfg.description || '', 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('twitter:card', 'summary');
  setMeta('twitter:title', cfg.title || document.title);
  setMeta('twitter:description', cfg.description || '');
})();
