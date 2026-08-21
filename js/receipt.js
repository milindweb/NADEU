/**
 * receipt.js - Receipt form logic, validation, submit, recent entries table
 */

const Receipt = {
  form: null,
  recentTable: null,
  editMode: false,
  editId: null,
  selectedEmployee: null,
  
  async init() {
    this.form = document.getElementById('receiptForm');
    this.recentTable = document.getElementById('recentTable');
    this.bindEvents();
    FormPersist.restore(this.form);
    await Employee.load();
    this.loadRecent();
    
    // Set default amount
    const amountEl = this.form.querySelector('[name="amount"]');
    if (amountEl && !amountEl.value) amountEl.value = '200';
  },
  
  bindEvents() {
    // Form submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Clear form
    document.getElementById('clearForm')?.addEventListener('click', () => {
      const msgEl = document.getElementById('formMessage');
      if (msgEl) msgEl.className = 'form-message hidden';
      clearTimeout(this._formMsgTimer);
      this.clearForm();
    });
    
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
    
    // Designation radio → input sync
    const desigInput = document.getElementById('designationInput');
    this.form.querySelectorAll('input[name="designation"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (desigInput) desigInput.value = e.target.value;
      });
    });
    if (desigInput) {
      desigInput.addEventListener('input', () => {
        this.form.querySelectorAll('input[name="designation"]').forEach(r => r.checked = false);
      });
    }
    
    // Recent entries toggle
    document.getElementById('toggleRecent')?.addEventListener('click', (e) => {
      document.getElementById('recentList').classList.toggle('collapsed');
      e.target.textContent = document.getElementById('recentList').classList.contains('collapsed') ? '▶' : '▼';
    });
    
    // Refresh recent receipts
    document.getElementById('refreshRecent')?.addEventListener('click', () => this.loadRecent());
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
        <span class="meta">${emp['Location'] || ''} • ${emp['Rank'] || emp['Post'] || ''}</span>
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
      
      const receiptNo = data['Receipt No.'] || '';
      const msg = (this.editMode ? 'Receipt updated' : 'Receipt saved') + (receiptNo ? ' — #' + receiptNo : '');
      this.showFormMessage(msg, 'success');
      Auth.showToast(msg);
      this.clearForm();
      this.loadRecent();
    } catch (err) {
      this.showFormMessage('Error: ' + err.message, 'error');
      Auth.showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },
  
  showFormMessage(msg, type) {
    const el = document.getElementById('formMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-message ' + type;
    clearTimeout(this._formMsgTimer);
    this._formMsgTimer = setTimeout(() => { el.className = 'form-message hidden'; }, 5000);
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

    const rank = emp['Rank'] || emp['Post'] || '';
    if (formData.Designation && formData.Designation.toLowerCase() !== rank.toLowerCase()) {
      updates['Rank'] = formData.Designation;
      updates['Post'] = formData.Designation;
    }

    if (formData.Location && formData.Location.toLowerCase() !== (emp['Location'] || '').toLowerCase()) {
      updates['Location'] = formData.Location;
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
    const missing = [];
    
    required.forEach(el => {
      el.classList.remove('error', 'valid');
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
        const label = el.closest('.field')?.querySelector('label')?.textContent?.replace(' *', '') || el.name;
        if (!missing.includes(label)) missing.push(label);
      } else {
        el.classList.add('valid');
      }
    });
    
    // Radio groups
    ['location', 'status'].forEach(name => {
      const checked = this.form.querySelector('input[name="' + name + '"]:checked');
      const radios = this.form.querySelectorAll('input[name="' + name + '"]');
      radios.forEach(r => r.classList.remove('error', 'valid'));
      if (!checked) {
        radios.forEach(r => r.classList.add('error'));
        valid = false;
        const legend = this.form.querySelector('input[name="' + name + '"]')?.closest('fieldset')?.querySelector('legend')?.textContent?.replace(' *', '') || name;
        if (!missing.includes(legend)) missing.push(legend);
      } else {
        radios.forEach(r => { if (r.checked) r.classList.add('valid'); });
      }
    });
    
    // Designation text input
    const desigInput = document.getElementById('designationInput');
    if (desigInput) {
      desigInput.classList.remove('error', 'valid');
      if (!desigInput.value.trim()) {
        desigInput.classList.add('error');
        valid = false;
        if (!missing.includes('Designation')) missing.push('Designation');
      } else {
        desigInput.classList.add('valid');
      }
    }
    
    if (!valid) {
      Auth.showToast('Please fill: ' + missing.join(', '), 'error');
    }
    
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
      'Section': raw.section || '',
      'Amount': raw.amount || '',
      'Receipt No.': raw.receiptNo || '',
      'Remark': raw.remark || ''
    };
    
    // Get radio values (skip designation — uses text input)
    ['location', 'status'].forEach(name => {
      const checked = this.form.querySelector('input[name="' + name + '"]:checked');
      if (checked) {
        const key = name === 'location' ? 'Location' : name.charAt(0).toUpperCase() + name.slice(1);
        data[key] = checked.value;
      }
    });
    
    // Designation from text input (radio clicks populate it)
    data.Designation = document.getElementById('designationInput')?.value?.trim() || '';
    
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
    
    const tbody = document.getElementById('recentTbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty">Loading...</td></tr>';
    
    try {
      const res = await API.getReceipts(Auth.token);
      const data = res.data || res;
      const receipts = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      
      receipts.sort((a, b) => {
        const da = a['Created At'] || '';
        const db = b['Created At'] || '';
        return db.localeCompare(da);
      });
      
      this.renderRecentTable(receipts);
    } catch (err) {
      console.error('Failed to load recent:', err);
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty">Failed to load receipts</td></tr>';
    }
  },
  
  renderRecentTable(data) {
    const tbody = document.getElementById('recentTbody');
    if (!tbody) return;
    
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No receipts yet</td></tr>';
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
    
    tbody.querySelectorAll('tr[data-id]').forEach(row => {
      row.addEventListener('click', () => this.loadForEdit(row.dataset.id));
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
    
    // Radio values
    this.setRadioValue('designation', r['Designation'] || '');
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
    // For designation, also set the text input
    if (name === 'designation') {
      const input = document.getElementById('designationInput');
      if (input) input.value = value;
    }
  }
};

// Form persistence
const FormPersist = {
  save(form) {
    const data = {};
    new FormData(form).forEach((v, k) => data[k] = v);
    // Radio values
    ['location', 'status'].forEach(name => {
      const checked = form.querySelector('input[name="' + name + '"]:checked');
      if (checked) data[name] = checked.value;
    });
    // Designation from text input
    const desigInput = form.querySelector('#designationInput');
    if (desigInput) data.designation = desigInput.value;
    localStorage.setItem(CONFIG.STORAGE_KEYS.FORM_DATA, JSON.stringify(data));
  },
  
  restore(form) {
    const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FORM_DATA) || '{}');
    Object.entries(data).forEach(([k, v]) => {
      const el = form.querySelector('[name="' + k + '"]');
      if (el && el.type !== 'radio') el.value = v;
    });
    // Restore designation input
    if (data.designation) {
      const input = form.querySelector('#designationInput');
      if (input) input.value = data.designation;
      // Also check matching radio if exists
      const radio = form.querySelector('input[name="designation"][value="' + data.designation + '"]');
      if (radio) radio.checked = true;
    }
    // Restore radios
    ['location', 'status'].forEach(name => {
      if (data[name]) {
        const radio = form.querySelector('input[name="' + name + '"][value="' + data[name] + '"]');
        if (radio) radio.checked = true;
      }
    });
  },
  
  clear() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.FORM_DATA);
  }
};

// Initialize when auth succeeds
document.addEventListener('auth:success', () => Receipt.init());