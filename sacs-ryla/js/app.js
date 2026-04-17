// ============================================================
// SACS RYLA Workbook — app.js
// Session management, autosave, phase navigation
// ============================================================

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────
  const API_ENDPOINT = '/api/workbook';
  const SAVE_DEBOUNCE_MS = 1200;
  const SESSION_KEY = 'ryla_session_id';
  const TOTAL_PHASES = 5;

  // ── State ──────────────────────────────────────────────────
  let currentPhase = 0;
  let saveTimer = null;
  let sessionId = null;
  let doneMask = 0; // bitmask of completed phases

  // ── Session ID ─────────────────────────────────────────────
  function getOrCreateSession() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'ryla-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  // ── Collect all field data ─────────────────────────────────
  function collectData() {
    const fields = document.querySelectorAll('[data-field]');
    const data = { session_id: sessionId };
    fields.forEach(el => {
      data[el.dataset.field] = el.value || '';
    });
    return data;
  }

  // ── Populate fields from saved data ───────────────────────
  function populateData(data) {
    if (!data) return;
    const fields = document.querySelectorAll('[data-field]');
    fields.forEach(el => {
      const key = el.dataset.field;
      if (data[key] !== undefined && data[key] !== null) {
        el.value = data[key];
      }
    });
  }

  // ── Save status UI ─────────────────────────────────────────
  function setSaveStatus(state) {
    const dot = document.getElementById('save-dot');
    const txt = document.getElementById('save-text');
    if (!dot || !txt) return;
    dot.className = 'save-dot ' + state;
    if (state === 'saving') txt.textContent = 'Saving…';
    else if (state === 'saved') txt.textContent = 'All changes saved';
    else txt.textContent = 'Unsaved changes';
  }

  // ── Debounced autosave ────────────────────────────────────
  function scheduleAutosave() {
    setSaveStatus('');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveToBackend, SAVE_DEBOUNCE_MS);
  }

  async function saveToBackend() {
    setSaveStatus('saving');
    try {
      const data = collectData();
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
    } catch (e) {
      console.error('Save error:', e);
      setSaveStatus('');
      showToast('⚠ Could not save — check your connection');
    }
  }

  // ── Load from backend ─────────────────────────────────────
  async function loadFromBackend() {
    try {
      const res = await fetch(`${API_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        populateData(json.data);
        setSaveStatus('saved');
        showToast('📂 Workbook restored from your last session');
      }
    } catch (e) {
      console.warn('Could not load saved data:', e);
    }
  }

  // ── Phase Navigation ──────────────────────────────────────
  function goPhase(n) {
    if (n < 0 || n >= TOTAL_PHASES) return;

    // Hide current
    const prev = document.getElementById('phase-' + currentPhase);
    if (prev) prev.classList.remove('visible');

    currentPhase = n;

    // Show new
    const next = document.getElementById('phase-' + currentPhase);
    if (next) next.classList.add('visible');

    // Update sidebar buttons
    document.querySelectorAll('.ph-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === currentPhase);
    });

    // Update progress bar
    const pct = ((currentPhase + 1) / TOTAL_PHASES * 100).toFixed(0);
    const bar = document.getElementById('progress-fill');
    if (bar) bar.style.width = pct + '%';
    const pctLabel = document.getElementById('progress-pct');
    if (pctLabel) pctLabel.textContent = pct + '%';

    // Scroll to top
    document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextPhase(current) {
    // Mark as done
    doneMask |= (1 << current);
    const btn = document.querySelectorAll('.ph-btn')[current];
    if (btn) btn.classList.add('done');

    saveToBackend().then(() => {
      showToast('✓ Progress saved');
      setTimeout(() => goPhase(current + 1), 500);
    });
  }

  // ── Toast ──────────────────────────────────────────────────
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  // ── Attach autosave to all inputs ─────────────────────────
  function attachAutosave() {
    document.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', scheduleAutosave);
    });
  }

  // ── Session display ───────────────────────────────────────
  function displaySession() {
    const el = document.getElementById('session-display');
    if (el) el.textContent = sessionId;
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    sessionId = getOrCreateSession();
    displaySession();
    attachAutosave();
    goPhase(0);
    await loadFromBackend();
  }

  // ── Expose globals for inline onclick ─────────────────────
  window.goPhase  = goPhase;
  window.nextPhase = nextPhase;
  window.showToast = showToast;
  window.markComplete = function () {
    doneMask |= (1 << 4);
    document.querySelectorAll('.ph-btn').forEach(b => b.classList.add('done'));
    saveToBackend().then(() => showToast('🎉 Workbook complete! Well done on your DT journey.'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
