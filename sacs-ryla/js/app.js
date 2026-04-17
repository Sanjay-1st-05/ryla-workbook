// ============================================================
// SACS RYLA Workbook — app.js (UPDATED)
// ============================================================

(function () {
  'use strict';

  const API_ENDPOINT = '/api/workbook';
  const SAVE_DEBOUNCE_MS = 1200;
  const SESSION_KEY = 'ryla_session_id';
  const PHASE_KEY = 'ryla_current_phase';
  const TOTAL_PHASES = 5;

  let currentPhase = 0;
  let saveTimer = null;
  let sessionId = null;
  let doneMask = 0;

  // ── Session ───────────────────────────────────────────────
  function getOrCreateSession() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'ryla-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  // ── Data Handling ─────────────────────────────────────────
  function collectData() {
    const fields = document.querySelectorAll('[data-field]');
    const data = { session_id: sessionId };
    fields.forEach(el => {
      data[el.dataset.field] = el.value || '';
    });
    return data;
  }

  function populateData(data) {
    if (!data) return;
    document.querySelectorAll('[data-field]').forEach(el => {
      const key = el.dataset.field;
      if (data[key] !== undefined) {
        el.value = data[key];
      }
    });
  }

  // ── Save Status ───────────────────────────────────────────
  function setSaveStatus(state) {
    const dot = document.getElementById('save-dot');
    const txt = document.getElementById('save-text');
    if (!dot || !txt) return;

    dot.className = 'save-dot ' + state;

    if (state === 'saving') txt.textContent = 'Saving…';
    else if (state === 'saved') txt.textContent = 'All changes saved';
    else txt.textContent = 'Unsaved changes';
  }

  function scheduleAutosave() {
    setSaveStatus('');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveToBackend, SAVE_DEBOUNCE_MS);
  }

  async function saveToBackend() {
    setSaveStatus('saving');
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectData()),
      });

      if (!res.ok) throw new Error('Save failed');

      setSaveStatus('saved');
    } catch (e) {
      console.error(e);
      setSaveStatus('');
      showToast('⚠ Save failed');
    }
  }

  async function loadFromBackend() {
    try {
      const res = await fetch(`${API_ENDPOINT}?session_id=${sessionId}`);
      if (!res.ok) return;

      const json = await res.json();
      if (json.data) {
        populateData(json.data);
        setSaveStatus('saved');
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // ── Phase Navigation (FIXED) ───────────────────────────────
  function goPhase(n) {
    if (n < 0 || n >= TOTAL_PHASES) return;

    document.querySelectorAll('[id^="phase-"]').forEach(el => {
      el.classList.remove('visible');
    });

    currentPhase = n;

    const active = document.getElementById('phase-' + n);
    if (active) active.classList.add('visible');

    // Buttons
    document.querySelectorAll('.ph-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === n);
    });

    // Progress
    const pct = Math.round(((n + 1) / TOTAL_PHASES) * 100);

    const bar = document.getElementById('progress-fill');
    if (bar) bar.style.width = pct + '%';

    const label = document.getElementById('progress-pct');
    if (label) label.textContent = pct + '%';

    // Save phase
    localStorage.setItem(PHASE_KEY, n);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function attachPhaseButtons() {
    const buttons = document.querySelectorAll('.ph-btn');

    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        goPhase(index);
      });
    });
  }

  function nextPhase(current) {
    doneMask |= (1 << current);

    const btn = document.querySelectorAll('.ph-btn')[current];
    if (btn) btn.classList.add('done');

    saveToBackend().then(() => {
      showToast('✓ Saved');
      setTimeout(() => goPhase(current + 1), 400);
    });
  }

  // ── Toast ─────────────────────────────────────────────────
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;

    t.textContent = msg;
    t.classList.add('show');

    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ── Autosave Binding ──────────────────────────────────────
  function attachAutosave() {
    document.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', scheduleAutosave);
    });
  }

  // ── Session Display ───────────────────────────────────────
  function displaySession() {
    const el = document.getElementById('session-display');
    if (el) el.textContent = sessionId;
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    sessionId = getOrCreateSession();

    displaySession();
    attachAutosave();
    attachPhaseButtons(); // ⭐ NEW

    const savedPhase = localStorage.getItem(PHASE_KEY);
    goPhase(savedPhase ? parseInt(savedPhase) : 0);

    await loadFromBackend();
  }

  // ── Global Exposure ───────────────────────────────────────
  window.goPhase = goPhase;
  window.nextPhase = nextPhase;

  window.markComplete = function () {
    doneMask |= (1 << 4);
    document.querySelectorAll('.ph-btn').forEach(b => b.classList.add('done'));
    saveToBackend().then(() => showToast('🎉 Completed!'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();