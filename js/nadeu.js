/**
 * nadeu.js - NADEU public portal: Office Bearers fetch & render
 */

const Nadeu = {
  bearers: [],
  currentUnit: 'All',

  async init() {
    this.bindUnitFilter();
    await this.loadBearers();
  },

  async loadBearers() {
    var container = document.getElementById('bearersList');
    if (!container) return;

    container.innerHTML = '<div class="bearers-loading">Loading office bearers...</div>';

    try {
      var res = await API.getOfficeBearers();
      this.bearers = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      this.renderBearers();
    } catch (err) {
      container.innerHTML = '<div class="bearers-empty">Failed to load office bearers. Please try again later.</div>';
    }
  },

  bindUnitFilter() {
    var btns = document.querySelectorAll('.unit-filter-btn');
    var self = this;
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self.currentUnit = btn.dataset.unit || 'All';
        self.renderBearers();
      });
    });
  },

  getFilteredBearers() {
    if (this.currentUnit === 'All') return this.bearers;
    var unit = this.currentUnit.toUpperCase();
    return this.bearers.filter(function(b) {
      var loc = (b['Unit'] || b['Location'] || '').toUpperCase();
      return loc.indexOf(unit) !== -1;
    });
  },

  getRoleOrder(rank) {
    var r = (rank || '').toUpperCase();
    if (r.indexOf('PRESIDENT') !== -1 && r.indexOf('VICE') === -1 && r.indexOf('WORKING') === -1) return 1;
    if (r.indexOf('WORKING') !== -1) return 2;
    if (r.indexOf('VICE') !== -1) return 3;
    if (r.indexOf('GENERAL SECRETARY') !== -1) return 4;
    if (r.indexOf('JT.') !== -1 || r.indexOf('JOINT') !== -1) return 5;
    if (r.indexOf('SECRETARY') !== -1) return 6;
    if (r.indexOf('ORGANISING') !== -1) return 7;
    if (r.indexOf('TREASURER') !== -1) return 8;
    if (r.indexOf('ASST') !== -1) return 9;
    if (r.indexOf('MANAGING') !== -1) return 10;
    return 11;
  },

  renderBearers() {
    var container = document.getElementById('bearersList');
    if (!container) return;

    var filtered = this.getFilteredBearers();
    if (!filtered.length) {
      container.innerHTML = '<div class="bearers-empty">No office bearers found.</div>';
      return;
    }

    // Sort by role priority
    var self = this;
    filtered.sort(function(a, b) {
      return self.getRoleOrder(a['RANK'] || a['Rank']) - self.getRoleOrder(b['RANK'] || b['Rank']);
    });

    var html = '<div class="bearers-grid">';
    filtered.forEach(function(b) {
      var name = b['NAME & DESIGN / T.NO.'] || b['Name'] || '';
      var rank = b['RANK'] || b['Rank'] || '';
      var unit = b['UNIT'] || b['Unit'] || '';

      html += '<div class="bearer-card">' +
        '<div class="bearer-avatar">' + self.getInitials(name) + '</div>' +
        '<div class="bearer-info">' +
          '<h4 class="bearer-name">' + self.escapeHtml(name) + '</h4>' +
          '<span class="bearer-rank">' + self.escapeHtml(rank) + '</span>' +
          '<span class="bearer-unit">' + self.escapeHtml(unit) + '</span>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  },

  getInitials(name) {
    var parts = name.replace(/^SHRI\s+|^SMT\.\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('bearersList')) {
    Nadeu.init();
  }
});
