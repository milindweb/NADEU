/**
 * config.js - Frontend configuration
 * UPDATE API_URL after deploying Apps Script
 */

const CONFIG = {
  // UPDATE THIS after deploying Apps Script as Web App
  API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  MODULE: 'receipt',
  STORAGE_KEYS: {
    TOKEN: 'nadeu_token',
    USER: 'nadeu_user',
    REMEMBER: 'nadeu_remember',
    FORM_DATA: 'nadeu_form_data',
    EMPLOYEES_CACHE: 'nadeu_employees_cache',
    EMPLOYEES_CACHE_TIME: 'nadeu_employees_cache_time'
  },
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_DEBOUNCE: 300,
  DEFAULT_PAGE_SIZE: 10
};