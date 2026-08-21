/**
 * employee.js - Employee search, cache, sync
 */

const Employee = {
  cache: [],
  cacheTime: 0,
  searchDebounce: null,
  
  async load(force = false) {
    const now = Date.now();
    const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.EMPLOYEES_CACHE);
    const cachedTime = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.EMPLOYEES_CACHE_TIME) || '0');
    
    if (!force && cached && (now - cachedTime) < CONFIG.CACHE_TTL) {
      this.cache = JSON.parse(cached);
      this.cacheTime = cachedTime;
      document.dispatchEvent(new CustomEvent('employees:loaded', { detail: this.cache }));
      return this.cache;
    }
    
    if (!Auth.token) return [];
    
    try {
      this.cache = await API.getEmployees(Auth.token);
      this.cacheTime = now;
      localStorage.setItem(CONFIG.STORAGE_KEYS.EMPLOYEES_CACHE, JSON.stringify(this.cache));
      localStorage.setItem(CONFIG.STORAGE_KEYS.EMPLOYEES_CACHE_TIME, this.cacheTime.toString());
      document.dispatchEvent(new CustomEvent('employees:loaded', { detail: this.cache }));
      return this.cache;
    } catch (err) {
      console.error('Failed to load employees:', err);
      if (cached) {
        this.cache = JSON.parse(cached);
        return this.cache;
      }
      return [];
    }
  },
  
  search(query) {
    if (!query || query.length < 1) return [];
    
    const q = query.toLowerCase().trim();
    return this.cache.filter(emp => {
      return Object.values(emp).some(v => 
        String(v || '').toLowerCase().includes(q)
      );
    }).slice(0, 15);
  },
  
  getByToken(token) {
    const keys = ['Tokan No.', 'Token No.'];
    return this.cache.find(emp => 
      keys.some(k => String(emp[k] || '').trim() === String(token).trim())
    );
  },
  
  async syncFromSeniority() {
    if (!Auth.token) throw new Error('Not authenticated');
    return await API.syncEmployees(Auth.token);
  },
  
  debouncedSearch(query, callback) {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      const results = this.search(query);
      callback(results);
    }, CONFIG.SEARCH_DEBOUNCE);
  },
  
  populateForm(emp, form) {
    if (!emp || !form) return;
    
    const map = {
      'empName': ['Name'],
      'empToken': ['Tokan No.', 'Token No.'],
      'empMobile': ['Mobile No.'],
      'location': ['Location']
    };
    
    Object.entries(map).forEach(([fieldId, keys]) => {
      const el = form.querySelector('[name="' + fieldId + '"]') || form.querySelector('#' + fieldId);
      if (!el) return;
      
      for (const key of keys) {
        if (emp[key]) {
          el.value = emp[key];
          break;
        }
      }
    });
    
    // Update radio buttons
    this.setRadioValue(form, 'designation', emp['Rank'] || emp['Post'] || '');
    this.setRadioValue(form, 'location', emp['Location'] || '');
    
    // Save to localStorage for reuse
    FormPersist.save(form);
  },
  
  setRadioValue(form, name, value) {
    if (!value) return;
    const radios = form.querySelectorAll('input[name="' + name + '"]');
    let matched = false;
    radios.forEach(r => {
      if (r.value.toLowerCase() === value.toLowerCase()) {
        r.checked = true;
        matched = true;
      }
    });
    // For designation, also set the text input
    if (name === 'designation') {
      const input = form.querySelector('#designationInput');
      if (input) input.value = value;
    }
  }
};