// ════════════════════════════════════════════════════════════════════
//  api.js — Frontend → Backend connection layer
//  Reads VITE_API_URL from environment (set in Render Static Site env vars).
//  Falls back to empty (same-origin) for local dev.
// ════════════════════════════════════════════════════════════════════

const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

function authHeaders() {
  const token = localStorage.getItem('wi_token'); // saved after login
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
               : { 'Content-Type': 'application/json' };
}

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, { headers: authHeaders(), ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'שגיאת שרת');
  return data;
}

export const api = {
  // ── Auth ──
  register: (email, password, displayName) =>
    req('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  login: (email, password) =>
    req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // ── Today / tasks / morning ──
  getToday: () => req('/api/today'),
  createTask: (task) => req('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  toggleTask: (id) => req(`/api/tasks/${id}/toggle`, { method: 'PATCH' }),
  submitMorning: (data) => req('/api/morning', { method: 'POST', body: JSON.stringify(data) }),

  // ── System 2: daily quote ──
  getQuote: () => req('/api/quote/today'),

  // ── System 4: AI coach ──
  coachChat: (userMessage, mode = 'chat') =>
    req('/api/ai-coach/chat', { method: 'POST', body: JSON.stringify({ userMessage, mode }) }),

  // ── System 1: notifications ──
  registerPushToken: (pushToken) =>
    req('/api/notifications/register-token', { method: 'POST', body: JSON.stringify({ pushToken }) }),
  getTodayNotifications: () => req('/api/notifications/today'),

  // ── System 3: coupons ──
  mintCoupon: (code) => req('/api/coupons/mint', { method: 'POST', body: JSON.stringify({ code }) }),
  myCoupons: () => req('/api/coupons/mine'),
  redeemCoupon: (code) => req('/api/coupons/redeem', { method: 'POST', body: JSON.stringify({ code }) }),
};
