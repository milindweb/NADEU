/**
 * api-client.js - API wrapper for Google Apps Script
 */

const API = {
  async call(fn, args = {}, token = null, data = null) {
    const body = { fn, args };
    if (token) body.token = token;
    if (data && typeof data === 'object') Object.assign(body, data);

    let res;
    try {
      res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (err) {
      if (err.name === 'TypeError' && /failed to fetch|network|cors/i.test(err.message)) {
        throw new Error('Unable to reach the server. Please check your connection or try again later.');
      }
      throw err;
    }

    if (!res.ok) {
      throw new Error('Server error (' + res.status + '). Please try again.');
    }

    const json = await res.json();
    if (!json.ok) {
      const err = new Error(json.error || 'API Error');
      err.code = json.code;
      err.data = json;
      throw err;
    }
    return json.data;
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

  forgotPassword(identifier) {
    return this.call('forgotPassword', {}, null, { identifier });
  },

  changePassword(token, currentPassword, newPassword, confirmPassword) {
    return this.call('changePassword', {}, token, { currentPassword, newPassword, confirmPassword });
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

  getReceipt(id, token) {
    return this.call('getReceipt', [id], token);
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