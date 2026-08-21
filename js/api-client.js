/**
 * api-client.js - API wrapper for Google Apps Script
 */

const API = {
  async call(fn, args = {}, token = null) {
    const body = { fn, args };
    if (token) body.token = token;
    
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (!data.ok) {
      const err = new Error(data.error || 'API Error');
      err.code = data.code;
      err.data = data;
      throw err;
    }
    return data.data;
  },
  
  // Auth
  login(username, password, remember) {
    return this.call('login', {}, null, { username, password, remember });
  },
  
  register(userData) {
    return this.call('register', {}, null, userData);
  },
  
  check(token) {
    return this.call('check', {}, token);
  },
  
  currentUser(token) {
    return this.call('currentUser', {}, token);
  },
  
  logout(token) {
    return this.call('logout', {}, token);
  },
  
  // Employee
  syncEmployees(token) {
    return this.call('syncEmployees', [], token);
  },
  
  getEmployees(token) {
    return this.call('getEmployees', [], token);
  },
  
  searchEmployees(query, token) {
    return this.call('searchEmployees', [query], token);
  },
  
  getEmployee(tokenNo, token) {
    return this.call('getEmployee', [tokenNo], token);
  },
  
  saveEmployee(data, token) {
    return this.call('saveEmployee', [], token, data);
  },
  
  getEmployeeHeaders(token) {
    return this.call('employeeGetHeaders', [], token);
  },
  
  // Receipt
  saveReceipt(data, token) {
    return this.call('saveReceipt', [], token, data);
  },
  
  getReceipts(token) {
    return this.call('getReceipts', [], token);
  },
  
  getRecentReceipts(limit, token) {
    return this.call('getRecentReceipts', [limit], token);
  },
  
  getReceiptsPaginated(page, pageSize, sortBy, sortDir, filters, token) {
    return this.call('getReceiptsPaginated', [page, pageSize, sortBy, sortDir, filters], token);
  },
  
  deleteReceipt(id, token) {
    return this.call('deleteReceipt', [id], token);
  }
};