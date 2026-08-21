/**
 * receipt.js - Receipt form logic, validation, submit, recent entries table
 */

const Receipt = {
  form: null,
  recentTable: null,
  pagination: { page: 1, pageSize: 10, sortBy: 'Created At', sortDir: 'desc', filters: {} },
  editMode: false,
  editId: null,
  selectedEmployee: null,
  
  init() {
    this.form = document.getElementById('receiptForm');
    this.recentTable = document.getElementById('recentTable');
    this.bindEvents();
    this.loadRecent();
    FormPersist.restore(this.form);
    Employee.load();
    
    // Set default amount
    const amountEl = this.form.querySelector('[name="amount"]');
    if (amountEl && !amountEl.value) amountEl.value = '200';
  },
  
  bindEvents() {
    // Form submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Clear form
    document.getElementById('clearForm')?.addEventListener('click', () => this.clearForm());
    
    // Search input
    const searchEl = document.getElementById('empSearch');
    searchEl?.addEventListener('input', (e) => Employee.debouncedSearch(e.target.value, (results) => this.renderSearchResults(results)));
    searchEl?.addEventListener('focus', (e) => {
      if (e.target.value) Employee.debouncedSearch(e.target.value, (results) => this.renderSearchResults(results));
    });
    
    // Clear search
    document.getElementById('clearSearch')?.addEventListener('click', () => {
      searchEl.value = '';
      document.getElementById('searchResults').classList.add('hidden');
      document.getElementById('clearSearch').classList.add('hidden');
    });
    
    // Hide search results on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        document.getElementById('searchResults')?.classList.add('hidden');
        document.getElementById('clearSearch')?.classList.add('hidden');
      }
    });
    
    // Radio "Other" handling
    this.form.querySelectorAll('input[type="radio"][value="other"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const otherInput = document.querySelector('[data-other-for="' + e.target.name + '"]');
        if (otherInput) otherInput.classList.toggle('hidden', !e.target.checked);
      });
    });
    
    // Recent entries toggle
    document.getElementById('toggleRecent')?.addEventListener('click', (e) => {
      document.getElementById('recentList').classList.toggle('collapsed');
      e.target.textContent = document.getElementById('recentList').classList.contains('collapsed') ? '▶' : '▼';
    });
    
    // Pagination
    document.getElementById('pageSize')?.addEventListener('change', (e) => {
      this.pagination.pageSize = parseInt(e.target.value);
      this.pagination.page = 1;
      this.loadRecent();
    });
  },
  
  renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    const clearBtn = document.getElementById('clearSearch');
    const searchEl = document.getElementById('empSearch');
    
    if (!results.length) {
      container.classList.add('hidden');
      clearBtn.classList.add('hidden');
      return;
    }
    
    container.innerHTML = results.map(emp => `
      <div class="search-result" data-token="${emp['Tokan No.'] || emp['Token No.'] || ''}">
        <strong>${emp['Name'] || ''}</strong>
        <span class="meta">Token: ${emp['Tokan No.'] || emp['Token No.'] || ''}</span>
        <span class="meta">${emp['Location'] || ''} • ${emp['Post'] || ''} ${emp['Rank'] || ''}</span>
      </div>
    `).join('');
    
    container.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        const token = el.dataset.token;
        const emp = Employee.getByToken(token);
        if (emp) {
          this.selectedEmployee = { ...emp };
          Employee.populateForm(emp, this.form);
          searchEl.value = emp['Name'] + ' (' + token + ')';
          container.classList.add('hidden');
          clearBtn.classList.remove('hidden');
        }
      });
    });
    
    container.classList.remove('hidden');
    clearBtn.classList.remove('hidden');
  },
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) return;
    
    const btn = this.form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = this.editMode ? 'Updating...' : 'Submitting...';
    
    try {
      const data = this.collectFormData();
      const res = await API.saveReceipt(data, Auth.token);
      
      if (this.selectedEmployee) {
        await this.saveEmployeeEdits(data);
      }
      
      Auth.showToast(this.editMode ? 'Receipt updated' : 'Receipt saved');
      this.clearForm();
      this.loadRecent();
    } catch (err) {
      Auth.showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },
  
  async saveEmployeeEdits(formData) {
    const emp = this.selectedEmployee;
    if (!emp) return;

    const tokenKey = emp['Tokan No.'] ? 'Tokan No.' : 'Token No.';
    const token = emp[tokenKey];
    if (!token) return;

    const updates = {};
    updates[tokenKey] = token;

    const nameChanged = formData['Employee Name'] && formData['Employee Name'] !== (emp['Name'] || '');
    if (nameChanged) updates['Name'] = formData['Employee Name'];

    const mobileChanged = formData['Mobile No.'] && formData['Mobile No.'] !== (emp['Mobile No.'] || '');
    if (mobileChanged) updates['Mobile No.'] = formData['Mobile No.'];

    const post = emp['Post'] || '';
    if (formData.post && formData.post.toLowerCase() !== post.toLowerCase()) {
      updates['Post'] = formData.post;
    }

    const rank = emp['Rank'] || '';
    if (formData.rank && formData.rank.toLowerCase() !== rank.toLowerCase()) {
      updates['Rank'] = formData.rank;
    }

    if (formData.location && formData.location.toLowerCase() !== (emp['Location'] || '').toLowerCase()) {
      updates['Location'] = formData.location;
    }

    if (Object.keys(updates).length <= 1) return;

    try {
      await API.saveEmployee(updates, Auth.token);

      Object.keys(updates).forEach(k => { if (k !== tokenKey) emp[k] = updates[k]; });

      const idx = Employee.cache.findIndex(e =>
        (e['Tokan No.'] || e['Token No.']) === token
      );
      if (idx !== -1) Object.assign(Employee.cache[idx], updates);

      Auth.showToast('Employee record updated');
    } catch (err) {
      console.warn('Failed to update employee:', err.message);
    }
  },
  
  validateForm() {
    const required = this.form.querySelectorAll('[required]');
    let valid = true;
    
    required.forEach(el => {
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });
    
    // Radio groups
    ['post', 'rank', 'location', 'status'].forEach(name => {
      const checked = this.form.querySelector('input[name="' + name + '"]:checked');
      if (!checked) {
        this.form.querySelectorAll('input[name="' + name + '"]').forEach(r => r.classList.add('error'));
        valid = false;
      } else {
        this.form.querySelectorAll('input[name="' + name + '"]').forEach(r => r.classList.remove('error'));
      }
    });
    
    return valid;
  },
  
  collectFormData() {
    const fd = new FormData(this.form);
    const raw = {};
    fd.forEach((v, k) => raw[k] = v);
    
    // Map form field names to backend column names
    const data = {
      'Employee Name': raw.empName || '',
      'Token No.': raw.empToken || '',
      'Mobile No.': raw.empMobile || '',
      'Amount': raw.amount || '',
      'Receipt No.': raw.receiptNo || '',
      'Remark': raw.remark || ''
    };
    
    // Get radio values
    ['post', 'rank', 'location', 'status'].forEach(name => {
      const checked = this.form.querySelector('input[name="' + name + '"]:checked');
      if (checked) {
        data[name] = checked.value === 'other' 
          ? this.form.querySelector('[data-other-for="' + name + '"]')?.value || ''
          : checked.value;
      }
    });
    
    // Combine Post + Rank into Designation for receipt
    data.Designation = [data.post, data.rank].filter(Boolean).join(' ');
    
    if (this.editMode && this.editId) data.ID = this.editId;
    return data;
  },
  
  clearForm() {
    this.form.reset();
    this.form.querySelectorAll('[data-other-for]').forEach(el => el.classList.add('hidden'));
    this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    this.selectedEmployee = null;
    
    // Reset defaults
    const amountEl = this.form.querySelector('[name="amount"]');
    if (amountEl) amountEl.value = '200';
    
    const statusPaid = this.form.querySelector('input[name="status"][value="Paid"]');
    if (statusPaid) statusPaid.checked = true;
    
    this.editMode = false;
    this.editId = null;
    this.form.querySelector('button[type="submit"]').textContent = 'Submit';
    
    FormPersist.clear();
  },
  
  async loadRecent() {
    if (!Auth.token) return;
    
    try {
      const res = await API.getReceiptsPaginated(
        this.pagination.page,
        this.pagination.pageSize,
        this.pagination.sortBy,
        this.pagination.sortDir,
        this.pagination.filters,
        Auth.token
      );
      
      this.renderRecentTable(res.data, res.pagination);
    } catch (err) {
      console.error('Failed to load recent:', err);
    }
  },
  
  renderRecentTable(data, pagination) {
    const tbody = document.getElementById('recentTbody');
    const paginationEl = document.getElementById('pagination');
    
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No receipts yet</td></tr>';
      paginationEl.innerHTML = '';
      return;
    }
    
    tbody.innerHTML = data.map(r => `
      <tr data-id="${r.ID}" style="cursor:pointer">
        <td>${r['Receipt No.'] || ''}</td>
        <td>${r['Date'] || ''}</td>
        <td>${r['Employee Name'] || ''}</td>
        <td>${r['Token No.'] || ''}</td>
        <td>${r['Amount'] || 0}</td>
        <td><span class="status-badge ${(r['Status'] || '').toLowerCase()}">${r['Status'] || ''}</span></td>
        <td>${r['Created At'] || ''}</td>
      </tr>
    `).join('');
    
    // Row click to edit
    tbody.querySelectorAll('tr[data-id]').forEach(row => {
      row.addEventListener('click', () => this.loadForEdit(row.dataset.id));
    });
    
    // Headers for sorting
    document.querySelectorAll('#recentTable th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (this.pagination.sortBy === col) {
          this.pagination.sortDir = this.pagination.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.pagination.sortBy = col;
          this.pagination.sortDir = 'asc';
        }
        this.loadRecent();
      });
      
      // Update sort indicator
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.sort === this.pagination.sortBy) {
        th.classList.add(this.pagination.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    });
    
    // Pagination controls
    this.renderPagination(pagination);
  },
  
  renderPagination(p) {
    const el = document.getElementById('pagination');
    if (!el || p.totalPages <= 1) { el.innerHTML = ''; return; }
    
    let html = '';
    if (p.page > 1) html += `<button data-page="${p.page - 1}">← Prev</button>`;
    
    for (let i = 1; i <= p.totalPages; i++) {
      if (i === 1 || i === p.totalPages || (i >= p.page - 1 && i <= p.page + 1)) {
        html += `<button data-page="${i}" class="${i === p.page ? 'active' : ''}">${i}</button>`;
      } else if (i === p.page - 2 || i === p.page + 2) {
        html += '<span>…</span>';
      }
    }
    
    if (p.page < p.totalPages) html += `<button data-page="${p.page + 1}">Next →</button>`;
    
    el.innerHTML = html;
    el.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.pagination.page = parseInt(btn.dataset.page);
        this.loadRecent();
      });
    });
  },
  
  async loadForEdit(id) {
    try {
      const receipt = await API.getReceipt(id, Auth.token);
      if (!receipt) throw new Error('Receipt not found');
      
      this.populateForEdit(receipt);
    } catch (err) {
      Auth.showToast('Error loading receipt: ' + err.message, 'error');
    }
  },
  
  populateForEdit(r) {
    this.editMode = true;
    this.editId = r.ID;
    
    const map = {
      'empName': 'Employee Name',
      'empToken': 'Token No.',
      'empMobile': 'Mobile No.',
      'amount': 'Amount',
      'receiptNo': 'Receipt No.',
      'remark': 'Remark'
    };
    
    Object.entries(map).forEach(([field, key]) => {
      const el = this.form.querySelector('[name="' + field + '"]');
      if (el) el.value = r[key] || '';
    });
    
    // Radio values - split Designation into Post and Rank
    const designation = r['Designation'] || '';
    const ranks = ['HSK-II', 'HSK1', 'SK', 'MCM', 'UDC', 'LDC'];
    let postVal = designation;
    let rankVal = '';
    for (const rk of ranks) {
      if (designation.toLowerCase().endsWith(rk.toLowerCase())) {
        rankVal = designation.slice(designation.length - rk.length);
        postVal = designation.slice(0, designation.length - rk.length).trim();
        break;
      }
    }
    this.setRadioValue('post', postVal);
    this.setRadioValue('rank', rankVal);
    this.setRadioValue('location', r['Location'] || '');
    this.setRadioValue('status', r['Status'] || 'Paid');
    
    this.form.querySelector('button[type="submit"]').textContent = 'Update';
    FormPersist.save(this.form);
    
    // Scroll to form
    this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  
  setRadioValue(name, value) {
    const radios = this.form.querySelectorAll('input[name="' + name + '"]');
    let matched = false;
    radios.forEach(r => {
      r.checked = r.value.toLowerCase() === value.toLowerCase();
      if (r.checked) matched = true;
    });
    const otherRadio = this.form.querySelector('input[name="' + name + '"][value="other"]');
    const otherInput = this.form.querySelector('[data-other-for="' + name + '"]');
    if (!matched && otherRadio && otherInput) {
      otherRadio.checked = true;
      otherInput.value = value;
      otherInput.classList.remove('hidden');
    }
  }
};

// Form persistence
const FormPersist = {
  save(form) {
    const data = {};
    new FormData(form).forEach((v, k) => data[k] = v);
    // Radio values
    ['post', 'rank', 'location', 'status'].forEach(name => {
      const checked = form.querySelector('input[name="' + name + '"]:checked');
      if (checked) data[name] = checked.value === 'other' 
        ? form.querySelector('[data-other-for="' + name + '"]')?.value || ''
        : checked.value;
    });
    localStorage.setItem(CONFIG.STORAGE_KEYS.FORM_DATA, JSON.stringify(data));
  },
  
  restore(form) {
    const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FORM_DATA) || '{}');
    Object.entries(data).forEach(([k, v]) => {
      const el = form.querySelector('[name="' + k + '"]');
      if (el && el.type !== 'radio') el.value = v;
    });
    // Restore radios
    ['post', 'rank', 'location', 'status'].forEach(name => {
      if (data[name]) {
        const radio = form.querySelector('input[name="' + name + '"][value="' + data[name] + '"]');
        if (radio) radio.checked = true;
        else {
          const otherRadio = form.querySelector('input[name="' + name + '"][value="other"]');
          const otherInput = form.querySelector('[data-other-for="' + name + '"]');
          if (otherRadio && otherInput) {
            otherRadio.checked = true;
            otherInput.value = data[name];
            otherInput.classList.remove('hidden');
          }
        }
      }
    });
  },
  
  clear() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.FORM_DATA);
  }
};

// Initialize when auth succeeds
document.addEventListener('auth:success', () => Receipt.init());