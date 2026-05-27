/* ============================================================
   N8N WEBHOOK URLS
   ============================================================ */
const DEFAULT_ERROR_MSG = 'Something went wrong. Please try again.';

const WEBHOOKS = {
  verifyCode:     'https://n8n.srv1326537.hstgr.cloud/webhook/verify-access-code',
  onboarding:     'https://n8n.srv1326537.hstgr.cloud/webhook/tenant-onboarding',
  maintenance:    'https://n8n.srv1326537.hstgr.cloud/webhook/maintenance-request',
  contact:        'https://n8n.srv1326537.hstgr.cloud/webhook/tenant-contact',
  getDocuments:   'https://n8n.srv1326537.hstgr.cloud/webhook/get-tenant-documents',
  getTenantInfo:  'https://n8n.srv1326537.hstgr.cloud/webhook/get-tenant-info',
};

/* ============================================================
   SESSION / AUTH
   ============================================================ */

function getAccessCode() {
  return sessionStorage.getItem('accessCode');
}

function setAccessCode(code) {
  sessionStorage.setItem('accessCode', code.trim().toUpperCase());
}

function clearSession() {
  sessionStorage.removeItem('accessCode');
  sessionStorage.removeItem('tenantData');
}

function requireAuth() {
  const isDev = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (isDev && !getAccessCode()) {
    sessionStorage.setItem('accessCode', 'DEV-MODE');
    return;
  }
  if (!getAccessCode()) {
    window.location.href = 'index.html';
  }
}

function getTenantData() {
  const raw = sessionStorage.getItem('tenantData');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function setTenantData(data) {
  sessionStorage.setItem('tenantData', JSON.stringify(data));
}

/* ============================================================
   API
   ============================================================ */

async function apiPost(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

async function apiPostForm(url, formData) {
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

/* ============================================================
   UI HELPERS
   ============================================================ */

function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const safeType = ['error', 'success', 'warning', 'info'].includes(type) ? type : 'error';
  el.innerHTML = `<div class="alert alert--${safeType}">${escapeHtml(message)}</div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ============================================================
   NAVBAR
   ============================================================ */

function initNavbar() {
  const toggle = document.querySelector('.navbar__menu-toggle');
  const nav    = document.querySelector('.navbar__nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Mark active nav link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('is-active');
  });
}

/* ============================================================
   MULTI-STEP FORM
   ============================================================ */

function initStepForm(totalSteps) {
  let currentStep = 1;

  function showStep(n) {
    document.querySelectorAll('.step-panel').forEach((panel, i) => {
      panel.hidden = i + 1 !== n;
    });

    document.querySelectorAll('.step').forEach((dot, i) => {
      dot.classList.remove('is-active', 'is-done');
      if (i + 1 < n)  dot.classList.add('is-done');
      if (i + 1 === n) dot.classList.add('is-active');
    });

    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function next() {
    if (currentStep < totalSteps) showStep(currentStep + 1);
  }

  function prev() {
    if (currentStep > 1) showStep(currentStep - 1);
  }

  showStep(1);
  return { next, prev, showStep, getStep: () => currentStep };
}

/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {
  clearSession();
  window.location.href = 'index.html';
}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}

/* ============================================================
   INIT (runs on every page)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLogout();
});
